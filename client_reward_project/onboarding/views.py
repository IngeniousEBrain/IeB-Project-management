from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .serializers import ManagerRegistrationSerializer, SendCredentialsEmailSerializer, SendUserResetPasswordEmailSerializer, UserChangePasswordSerializer, UserLoginSerializer, UserRegistrationSerializer, UserResetPasswordSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UserRegistrationView(APIView):
    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            token = get_tokens_for_user(user)
            return Response({'user': serializer.data, 'token': token, 'msg':'Registration Successful'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request, format=None):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.data.get('email')
            password = serializer.data.get('password')
            user = authenticate(email=email, password=password)
            if user is not None:
                userDetails = UserSerializer(user)
                print(userDetails.data)
                token = get_tokens_for_user(user)
                return Response({'user': userDetails.data, 'token': token, 'msg':'Login successful'}, status=status.HTTP_200_OK)
            else:
                return Response({'errors': {'non_field_errors' : "Email or password doesn't match"}}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserChangePasswordView(APIView):
    # authentication_classes = [JWTTokenUserAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        serializer = UserChangePasswordSerializer(data=request.data, context={'user':request.user})
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Password changed Successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendUserResetPasswordEmailView(APIView):
    def post(self, request, format=None):
        serializer = SendUserResetPasswordEmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Password reset mail sent successfully. Please check your email'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserResetPasswordView(APIView):
    def post(self, request, uid, token, format=None):
        serializer = UserResetPasswordSerializer(data=request.data, context={'uid': uid, 'token': token})  
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Password reset Successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'msg':'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class ManagerRegistrationView(APIView):
    def post(self, request, format=None):
        serializer = ManagerRegistrationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            return Response({'user': serializer.data, 'msg':'Registration Successful'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
class SendCredentialEmailView(APIView):
    def post(self, request, format=None):
        serializer = SendCredentialsEmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Credentials sent successfully. Please check your email'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)