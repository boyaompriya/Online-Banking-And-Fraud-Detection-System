from django.urls import path

from .views import (
    account_fraud_alerts,
    update_fraud_alert,
)


urlpatterns = [
    path(
        'account/<int:account_id>/',
        account_fraud_alerts,
        name='account-fraud-alerts'
    ),

    path(
        'alert/<int:alert_id>/',
        update_fraud_alert,
        name='update-fraud-alert'
    ),
]