from django.db import models
from django.contrib.auth.hashers import make_password


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, password):
        self.password = make_password(password)

    def __str__(self):
        return self.email