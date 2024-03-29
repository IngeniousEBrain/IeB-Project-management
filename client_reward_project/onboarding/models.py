from email.policy import default
from tabnanny import verbose
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.

class UserManager(BaseUserManager):
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
        # user.is_admin = True
        user.save(using=self.db)
        return user

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    ph_number = PhoneNumberField()
    profile_picture = models.ImageField(upload_to='profile-pictures/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
class Role(models.Model):
    CLIENT = 'client'
    MANAGER = 'project_manager'
    HOLDER = 'key_account_holder'
    ROLE_CHOICES = (
        (CLIENT, 'Client'),
        (MANAGER, 'Project Manager'),
        (HOLDER, 'Key Account Holder')
    )
    role = models.CharField(max_length=20, choices = ROLE_CHOICES)

class Client(User):
    role = models.CharField(max_length=20, choices = Role.ROLE_CHOICES, default=Role.CLIENT)
    client_code = models.CharField()
    geographical_region = models.CharField(max_length=100)
    currency = models.CharField(max_length=3)
    address = models.TextField()

    class Meta:
        verbose_name = 'Client'

class Manager(User):
    role = models.CharField(max_length=20, choices = Role.ROLE_CHOICES, default=Role.MANAGER)
    employee_id = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Manager'

class KAH(User):  # KAH -> Key Account Holder
    role = models.CharField(max_length=20, choices = Role.ROLE_CHOICES, default=Role.HOLDER)
    employee_id = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Key Account Holder'
