from django.urls import path

from .views import (
    transfer_money,
    credit_money,
    debit_money,
    account_transactions,
)

urlpatterns = [
    path(
        'transfer/',
        transfer_money,
        name='transfer-money'
    ),

    path(
        'credit/',
        credit_money,
        name='credit-money'
    ),

    path(
        'debit/',
        debit_money,
        name='debit-money'
    ),

    path(
        'account/<int:account_id>/',
        account_transactions,
        name='account-transactions'
    ),
]