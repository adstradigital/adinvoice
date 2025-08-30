from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import User
from django.contrib.auth.hashers import make_password
import random


# Generate random 6-digit OTP
def generate_otp():
    return str(random.randint(100000, 999999))


# ================= SIGNUP API =================
@api_view(['POST'])
def signup(request):
    try:
        username = request.data.get("username")
        email = request.data.get("email")
        phone = request.data.get("phone")
        password = request.data.get("password")

        # Validation
        if not username or not email or not phone or not password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone=phone).exists():
            return Response({"error": "Phone already registered"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate OTPs
        email_otp = generate_otp()
        sms_otp = generate_otp()
        otp_expiry = timezone.now() + timedelta(minutes=5)

        # Create user
        user = User.objects.create(
            username=username,
            email=email,
            phone=phone,
            password=make_password(password),
            email_otp=email_otp,
            sms_otp=sms_otp,
            email_otp_expiry=otp_expiry,
            sms_otp_expiry=otp_expiry
        )

        # TODO: send email_otp and sms_otp via email/SMS services

        return Response({
            "success": "User created successfully. Please verify your OTPs.",
            "user_id": user.id,   # return user_id so frontend can send OTP verification requests
            "otp_expiry": otp_expiry
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ================= EMAIL OTP VERIFICATION API =================
@api_view(['POST'])
def verify_email_otp(request):
    try:
        user_id = request.data.get("user_id")
        email_otp = request.data.get("email_otp")

        if not user_id or not email_otp:
            return Response({"error": "User ID and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.email_otp != email_otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > user.email_otp_expiry:
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark email verified
        user.is_email_verified = True
        user.email_otp = None
        user.save()

        return Response({"success": "Email verified successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ================= SMS OTP VERIFICATION API =================
@api_view(['POST'])
def verify_sms_otp(request):
    try:
        user_id = request.data.get("user_id")
        sms_otp = request.data.get("sms_otp")

        if not user_id or not sms_otp:
            return Response({"error": "User ID and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.sms_otp != sms_otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > user.sms_otp_expiry:
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark phone verified
        user.is_phone_verified = True
        user.sms_otp = None
        user.save()

        return Response({"success": "Phone verified successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
