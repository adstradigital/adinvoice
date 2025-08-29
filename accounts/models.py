from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field is required")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)  # hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128)  # hashed by Django
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)

    email_otp = models.CharField(max_length=6, null=True, blank=True)
    sms_otp = models.CharField(max_length=6, null=True, blank=True)

    email_otp_expiry = models.DateTimeField(null=True, blank=True)
    sms_otp_expiry = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "phone"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username

    def set_email_otp(self, otp, expiry_minutes=5):
        self.email_otp = otp
        self.email_otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
        self.save()

    def set_sms_otp(self, otp, expiry_minutes=5):
        self.sms_otp = otp
        self.sms_otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
        self.save()
