from django.urls import path
from .views import register, login, verify_login


urlpatterns = [
    path(
        'register/',
        register,
        name='register'
    ),

    path(
        'login/',
        login,
        name='login'
    ),

    path(
        'verify-login/',
        verify_login,
        name='verify-login'
    ),
]