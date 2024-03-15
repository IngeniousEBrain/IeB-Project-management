from django.urls import path
from .views import ManagerRegistrationView, SendCredentialEmailView, UserChangePasswordView, UserLoginView, UserLogoutView, UserRegistrationView, SendUserResetPasswordEmailView, UserResetPasswordView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view()),
    path('admin-registrations/', ManagerRegistrationView.as_view()),
    path('login/', UserLoginView.as_view()),
    path('changepassword/', UserChangePasswordView.as_view()),
    path('send-reset-password-mail/', SendUserResetPasswordEmailView.as_view()),
    path('reset-password/<uid>/<token>/', UserResetPasswordView.as_view()),
    path('logout/', UserLogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send-credentials-mail/', SendCredentialEmailView.as_view(), name='credential-mail')
]
