from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from accounts.models import Account
from .models import FraudAlert


@api_view(['GET'])
def account_fraud_alerts(request, account_id):

    account = get_object_or_404(
        Account,
        id=account_id
    )

    alerts = FraudAlert.objects.filter(
        account=account
    ).order_by('-created_at')

    total_alerts = alerts.count()

    high_risk_alerts = alerts.filter(
        risk_level='HIGH'
    ).count()

    blocked_alerts = alerts.filter(
        status='BLOCKED'
    ).count()

    active_high_risk_alerts = alerts.filter(
        risk_level='HIGH'
    ).exclude(
        status='RESOLVED'
    ).count()

    if blocked_alerts > 0:
        account_status = "Blocked"
    elif active_high_risk_alerts > 0:
        account_status = "At Risk"
    else:
        account_status = "Secure"

    alert_data = []

    for alert in alerts:
        alert_data.append({
            'id': alert.id,

            'date': alert.created_at.strftime(
                '%d %b %Y'
            ),

            'description': alert.alert_type,

            'amount': (
                str(alert.amount)
                if alert.amount is not None
                else '-'
            ),

            'risk': alert.get_risk_level_display(),

            'status': alert.get_status_display(),

            'description_detail': (
                alert.description or ''
            ),
        })

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

            'summary': {
                'total_alerts': total_alerts,
                'high_risk': high_risk_alerts,
                'account_status': account_status,
            },

            'alerts': alert_data,
        },
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
def update_fraud_alert(request, alert_id):

    alert = get_object_or_404(
        FraudAlert,
        id=alert_id
    )

    new_status = request.data.get('status')

    allowed_statuses = [
        'MONITORING',
        'UNDER_REVIEW',
        'BLOCKED',
        'RESOLVED',
    ]

    if new_status not in allowed_statuses:
        return Response(
            {
                'error': (
                    'Invalid status. Choose '
                    'MONITORING, UNDER_REVIEW, '
                    'BLOCKED, or RESOLVED.'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    alert.status = new_status
    alert.save()

    return Response(
        {
            'message': 'Fraud alert updated successfully.',
            'alert': {
                'id': alert.id,
                'status': alert.get_status_display(),
                'risk': alert.get_risk_level_display(),
            }
        },
        status=status.HTTP_200_OK
    )