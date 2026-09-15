from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Account
import random


class AccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = Account

        fields = [
            'id',
            'name',
            'email',
            'phone',
            'account_number',
            'ifsc_code',
            'password',
            'balance',
        ]

        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'account_number': {
                'read_only': True
            },
            'ifsc_code': {
                'read_only': True
            },
            'balance': {
                'read_only': True
            },
        }

    def create(self, validated_data):

        # Generate a unique 16-digit account number
        while True:
            account_number = ''.join(
                random.choices(
                    '0123456789',
                    k=16
                )
            )

            if not Account.objects.filter(
                account_number=account_number
            ).exists():
                break

        # Default IFSC code for this project
        ifsc_code = "SBIN0001234"

        # Hash password before saving
        validated_data['password'] = make_password(
            validated_data['password']
        )

        # Add generated banking details
        validated_data['account_number'] = account_number
        validated_data['ifsc_code'] = ifsc_code

        return Account.objects.create(
            **validated_data
        )