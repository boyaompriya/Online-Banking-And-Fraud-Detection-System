from django.db import models
from accounts.models import Account


class FraudAlert(models.Model):

    RISK_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]

    STATUS_CHOICES = [
        ('MONITORING', 'Monitoring'),
        ('UNDER_REVIEW', 'Under Review'),
        ('BLOCKED', 'Blocked'),
        ('RESOLVED', 'Resolved'),
    ]

    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='fraud_alerts'
    )

    alert_type = models.CharField(max_length=200)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    risk_level = models.CharField(
        max_length=10,
        choices=RISK_CHOICES,
        default='MEDIUM'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='MONITORING'
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alert_type} - {self.risk_level}"