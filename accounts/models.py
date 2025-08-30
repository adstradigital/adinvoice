from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field is required")
        if not extra_fields.get("email"):
            raise ValueError("The Email field is required")
        if not extra_fields.get("phone"):
            raise ValueError("The Phone field is required")

        user = self.model(username=username, **extra_fields)
        user.set_password(password)  # hashes password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)

    # OTP fields
    email_otp = models.CharField(max_length=6, null=True, blank=True)
    sms_otp = models.CharField(max_length=6, null=True, blank=True)

    email_otp_expiry = models.DateTimeField(null=True, blank=True)
    sms_otp_expiry = models.DateTimeField(null=True, blank=True)

    # Permissions
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "phone"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username

    # OTP helpers
    def set_email_otp(self, otp, expiry_minutes=5):
        self.email_otp = otp
        self.email_otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
        self.save(update_fields=["email_otp", "email_otp_expiry"])

    def set_sms_otp(self, otp, expiry_minutes=5):
        self.sms_otp = otp
        self.sms_otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
        self.save(update_fields=["sms_otp", "sms_otp_expiry"])

    def is_email_otp_valid(self, otp):
        return (
            self.email_otp == otp and
            self.email_otp_expiry and
            timezone.now() <= self.email_otp_expiry
        )

    def is_sms_otp_valid(self, otp):
        return (
            self.sms_otp == otp and
            self.sms_otp_expiry and
            timezone.now() <= self.sms_otp_expiry
        )
