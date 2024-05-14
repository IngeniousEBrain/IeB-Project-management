from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AddOrganizationView, ClientRegistrationView, EmployeeRegistrationView, LoginView, SendCredentialEmailView, SendUserResetPasswordEmailView, UserChangePasswordView, UserLogoutView, UserResetPasswordView

urlpatterns = [
    path('add-organization/', AddOrganizationView.as_view()),
    path('register/', ClientRegistrationView.as_view()),
    path('admin-registrations/', EmployeeRegistrationView.as_view()),
    path('login/', LoginView.as_view()),
    path('changepassword/', UserChangePasswordView.as_view()),
    path('send-reset-password-mail/', SendUserResetPasswordEmailView.as_view()),
    path('reset-password/<uid>/<token>/', UserResetPasswordView.as_view()),
    path('logout/', UserLogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send-credentials-mail/', SendCredentialEmailView.as_view(), name='credential-mail')
]
