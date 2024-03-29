from rest_framework import serializers
from .utils import Util
from .models import KAH, Manager, User, Client
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields =  ['email', 'is_staff', 'is_superuser']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields =  ['role', 'client_code', 'geographical_region', 'currency', 'address', 'ph_number', 'email', 'first_name', 'last_name', 'profile_picture', 'is_staff']

class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields =  ['role', 'email', 'employee_id', 'is_staff']

class KAHSerializer(serializers.ModelSerializer):
    class Meta:
        model = KAH
        fields =  ['role', 'email', 'employee_id', 'is_staff']

class ClientRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        model = Client
        fields =  ['role', 'ph_number', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'profile_picture', 'client_code', 'geographical_region', 'currency', 'address']
        extra_kwargs= {
            'password':{'write_only':True}
        }

    # Validating existing email and password with confirm password
    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists!")
        else:
            password = attrs.get('password')
            confirm_password = attrs.pop('confirm_password')
            if password and confirm_password and password!=confirm_password:
                raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        return Client.objects.create_user(**validated_data)


class ManagerRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    # password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        model = Manager
        fields =  ['role', 'email', 'password']

    # Validating existing email
    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists!")
        return attrs
    
    def create(self, validated_data):
        return Manager.objects.create_user(**validated_data)
    
class KAHRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    # password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        model = KAH
        fields =  ['role', 'email', 'password']

    # Validating existing email
    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists!")
        return attrs
    
    def create(self, validated_data):
        return KAH.objects.create_user(**validated_data)

class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    class Meta:
        model = Client
        fields = ['email', 'password']

class UserChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    confirm_password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        fields = ['password', 'confirm_password']

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.pop('confirm_password')
        user = self.context.get('user')
        if password and confirm_password and password!=confirm_password:
            raise serializers.ValidationError("Passwords don't match")
        user.set_password(password)
        user.save()
        return attrs
    
class SendUserResetPasswordEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    class Meta:
        fields = ['email']

    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.id))
            print('Encoded uid ', uid)
            token = PasswordResetTokenGenerator().make_token(user)
            print('Generated Token ', token)
            reset_link = "http://localhost:3000/api/user/resetpassword/" + uid + '/' + token + '/' 
            print('Reset password link ', reset_link)
            body = 'Please click following link to reset your password: ' + reset_link
            data = {
                'subject':'Reset your password on IeB Project Management',
                'body': body,
                'to_email': user.email
            }
            Util.send_mail(data)
            return attrs
        else:
            raise serializers.ValidationError("You are not a registered user. Please register yourself first.")
        
    
class UserResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    confirm_password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        fields = ['password', 'confirm_password']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            confirm_password = attrs.pop('confirm_password')
            uid = self.context.get('uid')
            token = self.context.get('token')
            if password and confirm_password and password!=confirm_password:
                raise serializers.ValidationError("Passwords don't match")
            id = smart_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError("Token is invalid or expired.")
            user.set_password(password)
            user.save()
            return attrs
        except DjangoUnicodeDecodeError:
            PasswordResetTokenGenerator().check_token(user, token)
            raise serializers.ValidationError("Token is invalid or expired.")
        
        
class SendCredentialsEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        fields = ['email', 'password']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        body = 'You have been registered on IeB project Management Portal. Here are your credentials: \n\nEmail: ' + email + '\nPassword: ' + password
        data = {
            'subject':'Credentials for IeB Project Management Portal',
            'body': body,
            'to_email': email
        }
        Util.send_mail(data)
        return attrs
        