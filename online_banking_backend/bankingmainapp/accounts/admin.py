from django.contrib import admin
from .models import Account, LoginAttempt


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'email',
        'account_number',
        'ifsc_code',
        'balance',
        'created_at',
    )

    search_fields = (
        'name',
        'email',
        'account_number',
        'phone',
    )

    ordering = (
        '-created_at',
    )


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'email',
        'account',
        'ip_address',
        'login_time',
        'success',
        'risk_score',
        'risk_level',
        'failure_reason',
    )

    list_filter = (
        'success',
        'risk_level',
        'login_time',
    )

    search_fields = (
        'email',
        'account__name',
        'account__email',
        'ip_address',
        'failure_reason',
    )

    ordering = (
        '-login_time',
    )

    readonly_fields = (
        'login_time',
    )