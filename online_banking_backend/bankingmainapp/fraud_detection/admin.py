from django.contrib import admin
from .models import FraudAlert


@admin.register(FraudAlert)
class FraudAlertAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'account',
        'alert_type',
        'amount',
        'risk_level',
        'status',
        'created_at',
    )

    list_filter = (
        'risk_level',
        'status',
        'created_at',
    )

    search_fields = (
        'account__name',
        'account__email',
        'account__account_number',
        'alert_type',
        'description',
    )

    ordering = (
        '-created_at',
    )

    readonly_fields = (
        'created_at',
    )