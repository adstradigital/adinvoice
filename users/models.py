from django.contrib.auth.models import AbstractUser
from django.db import models
from adinvoice import settings
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("staff", "Staff"),
        ("entrepreneur", "Entrepreneur"),
    ]

    APPLICATION_STATUS = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="users"
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="staff")

    # Entrepreneur Profile Fields
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    alternate_phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    company_name = models.CharField(max_length=255, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    experience_years = models.PositiveIntegerField(blank=True, null=True)

    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)

    website = models.URLField(blank=True, null=True)
    linkedin_profile = models.URLField(blank=True, null=True)
    twitter_profile = models.URLField(blank=True, null=True)

    is_verified = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)

    # Application Status (pending / approved / rejected)
    application_status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default="pending")

    # 🔹 SMS OTP fields
    sms_otp_code = models.CharField(max_length=6, blank=True, null=True)
    sms_otp_expiry = models.DateTimeField(blank=True, null=True)
    sms_verified = models.BooleanField(default=False)

    # 🔹 Email OTP fields
    email_otp_code = models.CharField(max_length=6, blank=True, null=True)
    email_otp_expiry = models.DateTimeField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)

    # ---------------------------
    # ✅ Helper Methods
    # ---------------------------
    def set_sms_otp(self, code, expiry_minutes=10):
        self.sms_otp_code = code
        self.sms_otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
        self.sms_verified = False
        self.save()

    def verify_sms_otp(self, code):
        if self.sms_otp_code == code and self.sms_otp_expiry and timezone.now() <= self.sms_otp_expiry:
            self.sms_verified = True
            self.sms_otp_code = None  # clear OTP
            self.save()
            return True
        return False

    def set_email_otp(self, code, expiry_minutes=10):
        self.email_otp_code = code
        self.email_otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
        self.email_verified = False
        self.save()

    def verify_email_otp(self, code):
        if self.email_otp_code == code and self.email_otp_expiry and timezone.now() <= self.email_otp_expiry:
            self.email_verified = True
            self.email_otp_code = None  # clear OTP
            self.save()
            return True
        return False

    def __str__(self):
        return f"{self.username} ({self.role}) - {self.application_status}"


class Document(models.Model):
    DOC_TYPES = [
        ("pan", "PAN Card"),
        ("aadhar", "Aadhar Card"),
        ("gst", "GST Certificate"),
        ("company_reg", "Company Registration"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents"
    )
    doc_type = models.CharField(max_length=50, choices=DOC_TYPES)
    document_file = models.FileField(upload_to="documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.get_doc_type_display()}"