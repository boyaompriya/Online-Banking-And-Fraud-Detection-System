
from django.db import models


class Account(models.Model):
    name = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=15)

    account_number = models.CharField(
        max_length=18,
        unique=True,
        null=True,
        blank=True
    )

    ifsc_code = models.CharField(
        max_length=11,
        null=True,
        blank=True
    )

    password = models.CharField(max_length=128)

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=50000.00
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.account_number or self.email


class LoginAttempt(models.Model):

    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='login_attempts'
    )

    email = models.EmailField()

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )

    user_agent = models.TextField(
        blank=True,
        null=True
    )

    login_time = models.DateTimeField(
        auto_now_add=True
    )

    success = models.BooleanField(
        default=False
    )

    risk_score = models.IntegerField(
        default=0
    )

    risk_level = models.CharField(
        max_length=10,
        default='LOW'
    )

    failure_reason = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.email} - {self.risk_level} - {self.login_time}"
