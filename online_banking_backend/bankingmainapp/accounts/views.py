from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.hashers import check_password
from django.utils import timezone

from datetime import timedelta
import secrets

from .models import Account, LoginAttempt
from .serializers import AccountSerializer

from fraud_detection.models import FraudAlert


def get_client_ip(request):
    """
    Get the user's IP address.
    """

    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')

    if forwarded_for:
        return forwarded_for.split(',')[0].strip()

    return request.META.get('REMOTE_ADDR')


def calculate_login_risk(email):
    """
    Calculate login risk based on recent login activity.

    Risk levels:

    0 - 30   = LOW
    31 - 60  = MEDIUM
    61 - 100 = HIGH

    Failed attempts are checked during the last 10 minutes.
    """

    now = timezone.now()

    recent_time = now - timedelta(minutes=10)

    recent_attempts = LoginAttempt.objects.filter(
        email=email,
        login_time__gte=recent_time
    )

    failed_attempts = recent_attempts.filter(
        success=False
    ).count()

    total_attempts = recent_attempts.count()

    risk_score = 0

    # Failed login scoring

    if failed_attempts >= 1:
        risk_score += 15

    if failed_attempts >= 2:
        risk_score += 15

    if failed_attempts >= 3:
        risk_score += 20

    # Too many login attempts

    if total_attempts >= 4:
        risk_score += 20

    # Never allow score above 100

    risk_score = min(risk_score, 100)

    # Determine risk level

    if risk_score <= 30:
        risk_level = 'LOW'

    elif risk_score <= 60:
        risk_level = 'MEDIUM'

    else:
        risk_level = 'HIGH'

    return {
        'risk_score': risk_score,
        'risk_level': risk_level,
        'failed_attempts': failed_attempts,
        'total_attempts': total_attempts,
    }


def is_account_blocked(account):
    """
    Check whether the account has an active BLOCKED fraud alert.
    """

    return FraudAlert.objects.filter(
        account=account,
        status='BLOCKED'
    ).exists()


@api_view(['POST'])
def register(request):

    serializer = AccountSerializer(
        data=request.data
    )

    if serializer.is_valid():

        account = serializer.save()

        return Response(
            {
                "message": "Registration successful",

                "account": AccountSerializer(
                    account
                ).data
            },

            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login(request):

    email = request.data.get('email')
    password = request.data.get('password')

    ip_address = get_client_ip(request)

    user_agent = request.META.get(
        'HTTP_USER_AGENT',
        ''
    )

    # -------------------------------------------------
    # 1. Check required fields
    # -------------------------------------------------

    if not email or not password:

        LoginAttempt.objects.create(
            email=email or '',
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            risk_score=30,
            risk_level='LOW',
            failure_reason='Email and password are required'
        )

        return Response(
            {
                "error": "Email and password are required"
            },

            status=status.HTTP_400_BAD_REQUEST
        )

    # -------------------------------------------------
    # 2. Find account
    # -------------------------------------------------

    try:

        account = Account.objects.get(
            email=email
        )

    except Account.DoesNotExist:

        LoginAttempt.objects.create(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            risk_score=30,
            risk_level='LOW',
            failure_reason='Account does not exist'
        )

        return Response(
            {
                "error": "Invalid email or password"
            },

            status=status.HTTP_401_UNAUTHORIZED
        )

    # -------------------------------------------------
    # 3. Check whether account is already blocked
    # -------------------------------------------------

    if is_account_blocked(account):

        return Response(
            {
                "error": (
                    "Login blocked. Your account is currently "
                    "blocked due to suspicious activity."
                ),

                "login_security": {
                    "risk_score": 100,
                    "risk_level": "HIGH",
                    "account_status": "BLOCKED"
                }
            },

            status=status.HTTP_403_FORBIDDEN
        )

    # -------------------------------------------------
    # 4. Check password
    # -------------------------------------------------

    password_correct = check_password(
        password,
        account.password
    )

    # -------------------------------------------------
    # 5. WRONG PASSWORD
    # -------------------------------------------------

    if not password_correct:

        # Count previous attempts

        risk_data = calculate_login_risk(
            email
        )

        # Add current failed attempt

        failed_attempts = (
            risk_data['failed_attempts'] + 1
        )

        total_attempts = (
            risk_data['total_attempts'] + 1
        )

        # Recalculate risk including current attempt

        risk_score = 0

        if failed_attempts >= 1:
            risk_score += 15

        if failed_attempts >= 2:
            risk_score += 15

        if failed_attempts >= 3:
            risk_score += 20

        if total_attempts >= 4:
            risk_score += 20

        risk_score = min(
            risk_score,
            100
        )

        if risk_score <= 30:
            risk_level = 'LOW'

        elif risk_score <= 60:
            risk_level = 'MEDIUM'

        else:
            risk_level = 'HIGH'

        # Record failed login

        LoginAttempt.objects.create(
            account=account,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            risk_score=risk_score,
            risk_level=risk_level,
            failure_reason='Invalid password'
        )

        # -------------------------------------------------
        # HIGH RISK
        # -------------------------------------------------

        if risk_level == 'HIGH':

            FraudAlert.objects.create(
                account=account,
                alert_type='Suspicious login activity',
                amount=None,
                risk_level='HIGH',
                status='BLOCKED',
                description=(
                    'Multiple failed login attempts detected '
                    'within a short period. '
                    f'Risk score: {risk_score}. '
                    f'Failed attempts: {failed_attempts}. '
                    f'IP address: {ip_address}.'
                )
            )

            return Response(
                {
                    "error": (
                        "Login blocked due to "
                        "suspicious activity."
                    ),

                    "login_security": {
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "failed_attempts": failed_attempts,
                        "account_status": "BLOCKED"
                    }
                },

                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # MEDIUM RISK
        # -------------------------------------------------

        if risk_level == 'MEDIUM':

            # Generate a 6-digit demo verification code

            verification_code = str(
                secrets.randbelow(900000) + 100000
            )

            # Store verification information in session

            request.session['login_verification_account_id'] = account.id

            request.session['login_verification_email'] = email

            request.session['login_verification_code'] = verification_code

            request.session['login_verification_expires'] = (
                (timezone.now() + timedelta(minutes=5))
                .isoformat()
            )

            request.session['login_verification_ip'] = ip_address

            request.session['login_verification_user_agent'] = user_agent

            request.session.modified = True

            return Response(
                {
                    "error": (
                        "Additional verification "
                        "required."
                    ),

                    "login_security": {
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "failed_attempts": failed_attempts,
                        "requires_verification": True
                    },

                    # DEMO ONLY
                    # In a real system this should be
                    # sent through email/SMS.
                    "demo_verification_code": verification_code
                },

                status=status.HTTP_401_UNAUTHORIZED
            )

        # -------------------------------------------------
        # LOW RISK
        # -------------------------------------------------

        return Response(
            {
                "error": "Invalid email or password",

                "login_security": {
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "failed_attempts": failed_attempts
                }
            },

            status=status.HTTP_401_UNAUTHORIZED
        )

    # -------------------------------------------------
    # 6. CORRECT PASSWORD
    # -------------------------------------------------

    risk_data = calculate_login_risk(
        email
    )

    risk_score = risk_data['risk_score']
    risk_level = risk_data['risk_level']

    # Record successful login

    LoginAttempt.objects.create(
        account=account,
        email=email,
        ip_address=ip_address,
        user_agent=user_agent,
        success=True,
        risk_score=risk_score,
        risk_level=risk_level
    )

    # -------------------------------------------------
    # 7. Successful login
    # -------------------------------------------------

    return Response(
        {
            "message": "Login successful",

            "login_security": {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "failed_attempts": risk_data[
                    'failed_attempts'
                ],
                "account_status": "ACTIVE"
            },

            "account": AccountSerializer(
                account
            ).data
        },

        status=status.HTTP_200_OK
    )


# =====================================================
# MEDIUM-RISK VERIFICATION
# =====================================================

@api_view(['POST'])
def verify_login(request):

    verification_code = request.data.get(
        'verification_code'
    )

    if not verification_code:

        return Response(
            {
                "error": "Verification code is required."
            },

            status=status.HTTP_400_BAD_REQUEST
        )

    # Get stored session information

    account_id = request.session.get(
        'login_verification_account_id'
    )

    stored_email = request.session.get(
        'login_verification_email'
    )

    stored_code = request.session.get(
        'login_verification_code'
    )

    expires_at = request.session.get(
        'login_verification_expires'
    )

    stored_ip = request.session.get(
        'login_verification_ip'
    )

    stored_user_agent = request.session.get(
        'login_verification_user_agent',
        ''
    )

    # Check whether verification session exists

    if not account_id or not stored_code:

        return Response(
            {
                "error": (
                    "No active verification request. "
                    "Please login again."
                )
            },

            status=status.HTTP_400_BAD_REQUEST
        )

    # -------------------------------------------------
    # Check verification expiry
    # -------------------------------------------------

    if expires_at:

        try:

            expiry_time = timezone.datetime.fromisoformat(
                expires_at
            )

            if timezone.is_naive(expiry_time):

                expiry_time = timezone.make_aware(
                    expiry_time
                )

            if timezone.now() > expiry_time:

                request.session.pop(
                    'login_verification_account_id',
                    None
                )

                request.session.pop(
                    'login_verification_email',
                    None
                )

                request.session.pop(
                    'login_verification_code',
                    None
                )

                request.session.pop(
                    'login_verification_expires',
                    None
                )

                return Response(
                    {
                        "error": (
                            "Verification code has expired. "
                            "Please login again."
                        )
                    },

                    status=status.HTTP_401_UNAUTHORIZED
                )

        except ValueError:

            return Response(
                {
                    "error": "Invalid verification session."
                },

                status=status.HTTP_400_BAD_REQUEST
            )

    # -------------------------------------------------
    # Check verification code
    # -------------------------------------------------

    if str(verification_code) != str(stored_code):

        return Response(
            {
                "error": "Invalid verification code."
            },

            status=status.HTTP_401_UNAUTHORIZED
        )

    # -------------------------------------------------
    # Get account
    # -------------------------------------------------

    try:

        account = Account.objects.get(
            id=account_id
        )

    except Account.DoesNotExist:

        return Response(
            {
                "error": "Account not found."
            },

            status=status.HTTP_404_NOT_FOUND
        )

    # -------------------------------------------------
    # Check account block again
    # -------------------------------------------------

    if is_account_blocked(account):

        return Response(
            {
                "error": (
                    "Login blocked. Your account is "
                    "currently blocked."
                ),

                "login_security": {
                    "risk_score": 100,
                    "risk_level": "HIGH",
                    "account_status": "BLOCKED"
                }
            },

            status=status.HTTP_403_FORBIDDEN
        )

    # -------------------------------------------------
    # Calculate current login risk
    # -------------------------------------------------

    risk_data = calculate_login_risk(
        stored_email
    )

    # -------------------------------------------------
    # Record successful verified login
    # -------------------------------------------------

    LoginAttempt.objects.create(
        account=account,
        email=stored_email,
        ip_address=stored_ip,
        user_agent=stored_user_agent,
        success=True,
        risk_score=risk_data['risk_score'],
        risk_level='MEDIUM'
    )

    # -------------------------------------------------
    # Clear verification session
    # -------------------------------------------------

    request.session.pop(
        'login_verification_account_id',
        None
    )

    request.session.pop(
        'login_verification_email',
        None
    )

    request.session.pop(
        'login_verification_code',
        None
    )

    request.session.pop(
        'login_verification_expires',
        None
    )

    request.session.pop(
        'login_verification_ip',
        None
    )

    request.session.pop(
        'login_verification_user_agent',
        None
    )

    request.session.modified = True

    # -------------------------------------------------
    # Return successful login
    # -------------------------------------------------

    return Response(
        {
            "message": "Login verification successful",

            "login_security": {
                "risk_score": risk_data['risk_score'],
                "risk_level": "MEDIUM",
                "account_status": "ACTIVE"
            },

            "account": AccountSerializer(
                account
            ).data
        },

        status=status.HTTP_200_OK
    )