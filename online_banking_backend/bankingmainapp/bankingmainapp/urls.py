"""bankingmainapp URL Configuration"""

from django.contrib import admin
from django.urls import path, include


urlpatterns = [

    path(
        'admin/',
        admin.site.urls
    ),

    # Existing API
    path(
        'api/',
        include('app.urls')
    ),

    # Accounts API
    path(
        'api/accounts/',
        include('accounts.urls')
    ),

    # Transactions API
    path(
        'api/transactions/',
        include('transactions.urls')
    ),

    # Fraud Detection API
    path(
        'api/fraud/',
        include('fraud_detection.urls')
    ),

]