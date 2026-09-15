from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["name", "email", "phone", "password"]
        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):
        user = User(
            name=validated_data["name"],
            email=validated_data["email"],
            phone=validated_data["phone"],
        )

        user.set_password(validated_data["password"])
        user.save()

        return user