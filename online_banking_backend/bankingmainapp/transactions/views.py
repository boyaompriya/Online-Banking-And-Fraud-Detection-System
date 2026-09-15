from decimal import Decimal
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from accounts.models import Account
from .models import Transaction
from .serializers import TransactionSerializer

from fraud_detection.models import FraudAlert


# =========================================================
# FRAUD DETECTION SETTINGS
# =========================================================

LARGE_TRANSACTION_LIMIT = Decimal('25000.00')

RAPID_TRANSACTION_MINUTES = 5

RAPID_TRANSACTION_COUNT = 2


# =========================================================
# AUTOMATIC FRAUD DETECTION
# =========================================================

def check_fraud_alert(account, amount, transaction_description):
    """
    Automatically checks whether a transaction
    should create a fraud alert.
    """

    # -----------------------------------------------------
    # CHECK 1: LARGE TRANSACTION
    # -----------------------------------------------------

    if amount >= LARGE_TRANSACTION_LIMIT:

        FraudAlert.objects.create(
            account=account,
            alert_type='Large amount transaction detected',
            amount=amount,
            risk_level='HIGH',
            status='UNDER_REVIEW',
            description=(
                f'Large transaction of ₹{amount} detected '
                f'for {transaction_description}.'
            )
        )

        return

    # -----------------------------------------------------
    # CHECK 2: MULTIPLE TRANSACTIONS IN SHORT TIME
    # -----------------------------------------------------

    time_limit = timezone.now() - timedelta(
        minutes=RAPID_TRANSACTION_MINUTES
    )

    recent_transactions = Transaction.objects.filter(
        account=account,
        created_at__gte=time_limit
    ).count()

    if recent_transactions >= RAPID_TRANSACTION_COUNT:

        FraudAlert.objects.create(
            account=account,
            alert_type='Multiple transactions within short time',
            amount=amount,
            risk_level='MEDIUM',
            status='MONITORING',
            description=(
                f'Multiple transactions detected within '
                f'{RAPID_TRANSACTION_MINUTES} minutes.'
            )
        )


# =========================================================
# CHECK WHETHER ACCOUNT IS BLOCKED
# =========================================================

def is_account_blocked(account):
    """
    Returns True if the account has at least one
    fraud alert with BLOCKED status.
    """

    return FraudAlert.objects.filter(
        account=account,
        status='BLOCKED'
    ).exists()


# =========================================================
# TRANSFER MONEY
# =========================================================

@api_view(['POST'])
def transfer_money(request):

    sender_id = request.data.get('sender_id')

    receiver_account_number = request.data.get(
        'receiver_account_number'
    )

    receiver_ifsc_code = request.data.get(
        'receiver_ifsc_code'
    )

    amount = request.data.get('amount')

    description = request.data.get(
        'description',
        'Money Transfer'
    )

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not sender_id:
        return Response(
            {'error': 'Sender account ID is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not receiver_account_number:
        return Response(
            {'error': 'Receiver account number is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not receiver_ifsc_code:
        return Response(
            {'error': 'Receiver IFSC code is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not amount:
        return Response(
            {'error': 'Transfer amount is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    receiver_account_number = str(
        receiver_account_number
    ).strip()

    receiver_ifsc_code = str(
        receiver_ifsc_code
    ).strip().upper()

    try:
        amount = Decimal(str(amount))

    except (ValueError, TypeError):

        return Response(
            {'error': 'Invalid transfer amount.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if amount <= 0:

        return Response(
            {
                'error':
                    'Transfer amount must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # FIND SENDER
    # -----------------------------------------------------

    try:

        sender = Account.objects.get(
            id=sender_id
        )

    except Account.DoesNotExist:

        return Response(
            {'error': 'Sender account not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # CHECK IF SENDER ACCOUNT IS BLOCKED
    # -----------------------------------------------------

    if is_account_blocked(sender):

        return Response(
            {
                'error':
                    'Your account is blocked due to a fraud alert. '
                    'Transaction cannot be completed.'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # FIND RECEIVER
    # -----------------------------------------------------

    try:

        receiver = Account.objects.get(
            account_number=receiver_account_number,
            ifsc_code=receiver_ifsc_code
        )

    except Account.DoesNotExist:

        return Response(
            {
                'error':
                    'Receiver account not found. '
                    'Please check the account number and IFSC code.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # CHECK IF RECEIVER ACCOUNT IS BLOCKED
    # -----------------------------------------------------

    if is_account_blocked(receiver):

        return Response(
            {
                'error':
                    'The receiver account is blocked. '
                    'Transaction cannot be completed.'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # PREVENT SELF TRANSFER
    # -----------------------------------------------------

    if sender.id == receiver.id:

        return Response(
            {
                'error':
                    'You cannot transfer money to your own account.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # CHECK BALANCE
    # -----------------------------------------------------

    if sender.balance < amount:

        return Response(
            {'error': 'Insufficient balance.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # TRANSFER
    # -----------------------------------------------------

    with transaction.atomic():

        sender.balance -= amount

        sender.save(
            update_fields=['balance']
        )

        receiver.balance += amount

        receiver.save(
            update_fields=['balance']
        )

        Transaction.objects.create(
            account=sender,
            description=description,
            transaction_type='DEBIT',
            amount=amount,
            status='COMPLETED'
        )

        Transaction.objects.create(
            account=receiver,
            description=f'Received from {sender.name}',
            transaction_type='CREDIT',
            amount=amount,
            status='COMPLETED'
        )

        # Automatic fraud detection
        check_fraud_alert(
            sender,
            amount,
            description
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            'message': 'Money transferred successfully.',

            'sender': {
                'id': sender.id,
                'name': sender.name,
                'email': sender.email,
                'account_number': sender.account_number,
                'ifsc_code': sender.ifsc_code,
                'balance': str(sender.balance),
            },

            'receiver': {
                'id': receiver.id,
                'name': receiver.name,
                'email': receiver.email,
                'account_number': receiver.account_number,
                'ifsc_code': receiver.ifsc_code,
                'balance': str(receiver.balance),
            },

            'transaction': {
                'amount': str(amount),
                'description': description,
                'status': 'COMPLETED',
            }
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# CREDIT MONEY
# =========================================================

@api_view(['POST'])
def credit_money(request):

    account_number = request.data.get(
        'account_number'
    )

    ifsc_code = request.data.get(
        'ifsc_code'
    )

    amount = request.data.get(
        'amount'
    )

    description = request.data.get(
        'description',
        'Money Deposit'
    )

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not account_number:

        return Response(
            {'error': 'Account number is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not ifsc_code:

        return Response(
            {'error': 'IFSC code is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not amount:

        return Response(
            {'error': 'Credit amount is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    account_number = str(
        account_number
    ).strip()

    ifsc_code = str(
        ifsc_code
    ).strip().upper()

    try:

        amount = Decimal(str(amount))

    except (ValueError, TypeError):

        return Response(
            {'error': 'Invalid credit amount.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if amount <= 0:

        return Response(
            {
                'error':
                    'Credit amount must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # FIND ACCOUNT
    # -----------------------------------------------------

    try:

        account = Account.objects.get(
            account_number=account_number,
            ifsc_code=ifsc_code
        )

    except Account.DoesNotExist:

        return Response(
            {
                'error':
                    'Account not found. '
                    'Please check the account number and IFSC code.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # CHECK IF ACCOUNT IS BLOCKED
    # -----------------------------------------------------

    if is_account_blocked(account):

        return Response(
            {
                'error':
                    'Your account is blocked due to a fraud alert. '
                    'Credit transaction cannot be completed.'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # CREDIT
    # -----------------------------------------------------

    with transaction.atomic():

        account.balance += amount

        account.save(
            update_fields=['balance']
        )

        Transaction.objects.create(
            account=account,
            description=description,
            transaction_type='CREDIT',
            amount=amount,
            status='COMPLETED'
        )

        # Automatic fraud detection
        check_fraud_alert(
            account,
            amount,
            description
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            'message': 'Money credited successfully.',

            'account': {
                'id': account.id,
                'name': account.name,
                'email': account.email,
                'account_number': account.account_number,
                'ifsc_code': account.ifsc_code,
                'balance': str(account.balance),
            },

            'transaction': {
                'amount': str(amount),
                'description': description,
                'type': 'CREDIT',
                'status': 'COMPLETED',
            }
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# DEBIT MONEY
# =========================================================

@api_view(['POST'])
def debit_money(request):

    account_number = request.data.get(
        'account_number'
    )

    ifsc_code = request.data.get(
        'ifsc_code'
    )

    amount = request.data.get(
        'amount'
    )

    description = request.data.get(
        'description',
        'Money Withdrawal'
    )

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not account_number:

        return Response(
            {'error': 'Account number is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not ifsc_code:

        return Response(
            {'error': 'IFSC code is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not amount:

        return Response(
            {'error': 'Debit amount is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    account_number = str(
        account_number
    ).strip()

    ifsc_code = str(
        ifsc_code
    ).strip().upper()

    try:

        amount = Decimal(str(amount))

    except (ValueError, TypeError):

        return Response(
            {'error': 'Invalid debit amount.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if amount <= 0:

        return Response(
            {
                'error':
                    'Debit amount must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # FIND ACCOUNT
    # -----------------------------------------------------

    try:

        account = Account.objects.get(
            account_number=account_number,
            ifsc_code=ifsc_code
        )

    except Account.DoesNotExist:

        return Response(
            {
                'error':
                    'Account not found. '
                    'Please check the account number and IFSC code.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # CHECK IF ACCOUNT IS BLOCKED
    # -----------------------------------------------------

    if is_account_blocked(account):

        return Response(
            {
                'error':
                    'Your account is blocked due to a fraud alert. '
                    'Debit transaction cannot be completed.'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # CHECK BALANCE
    # -----------------------------------------------------

    if account.balance < amount:

        return Response(
            {'error': 'Insufficient balance.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # DEBIT
    # -----------------------------------------------------

    with transaction.atomic():

        account.balance -= amount

        account.save(
            update_fields=['balance']
        )

        Transaction.objects.create(
            account=account,
            description=description,
            transaction_type='DEBIT',
            amount=amount,
            status='COMPLETED'
        )

        # Automatic fraud detection
        check_fraud_alert(
            account,
            amount,
            description
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            'message': 'Money debited successfully.',

            'account': {
                'id': account.id,
                'name': account.name,
                'email': account.email,
                'account_number': account.account_number,
                'ifsc_code': account.ifsc_code,
                'balance': str(account.balance),
            },

            'transaction': {
                'amount': str(amount),
                'description': description,
                'type': 'DEBIT',
                'status': 'COMPLETED',
            }
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# ACCOUNT TRANSACTIONS
# =========================================================

@api_view(['GET'])
def account_transactions(request, account_id):

    try:

        account = Account.objects.get(
            id=account_id
        )

    except Account.DoesNotExist:

        return Response(
            {'error': 'Account not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    transactions = Transaction.objects.filter(
        account=account
    ).order_by('-created_at')

    serializer = TransactionSerializer(
        transactions,
        many=True
    )

    return Response(
        {
            'account': {
                'id': account.id,
                'name': account.name,
                'email': account.email,
                'account_number': account.account_number,
                'ifsc_code': account.ifsc_code,
                'balance': str(account.balance),
            },

            'transactions': serializer.data,
        },
        status=status.HTTP_200_OK
    )