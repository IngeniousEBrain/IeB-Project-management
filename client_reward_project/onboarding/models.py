from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, confirm_password=None, **extra_fields):
        if not email:
            raise ValueError('The email field must be set')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self.db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(email=email, password=password, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self.db)
        return user
    

class CustomUser(AbstractBaseUser):

    user_role = models.CharField(default='user')
    ph_number = PhoneNumberField()
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=20)
    profile_picture = models.ImageField(upload_to='profile-pictures/', blank=True)
    client_code = models.CharField()
    geographical_region = models.CharField(max_length=100)
    currency = models.CharField(max_length=3)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


