from tenants.models import Tenant
from users.serializers import UserSerializer
from django.contrib.auth.hashers import check_password
from .models import Document
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from common.decorators import role_required
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from django.utils import timezone
import secrets
import string
from .serializers import DocumentSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes, parser_classes



User = get_user_model()



# Endpoint: Email OTP verification
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_otp(request):
    try:
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate OTP
        if user.email_otp != otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # Expiry check
        if user.email_otp_created_at < timezone.now() - timedelta(minutes=10):
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark email as verified
        user.email_verified = True
        user.email_otp = None  # clear OTP after success
        user.save()

        return Response({"success": "Email verified successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






# Endpoint: SMS OTP verification
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_sms_otp(request):
    try:
        phone = request.data.get("phone")
        otp = request.data.get("otp")

        if not phone or not otp:
            return Response({"error": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate OTP
        if user.sms_otp != otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # Expiry check
        if user.sms_otp_created_at < timezone.now() - timedelta(minutes=10):
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark phone as verified
        user.sms_verified = True
        user.sms_otp = None
        user.save()

        return Response({"success": "Phone verified successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# Endpoint: Register Entrepreneur
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register_entrepreneur(request):
#     try:
#         data = request.data

#         # Collect entrepreneur details
#         first_name = data.get("first_name")
#         last_name = data.get("last_name")
#         email = data.get("email")
#         phone = data.get("phone")
#         address = data.get("address")
#         date_of_birth = data.get("date_of_birth")
#         company_name = data.get("company_name")


#         # Basic validation
#         if not first_name or not last_name or not email or not phone:
#             return Response({"error": "First name, last name, email and phone are required"},
#                             status=status.HTTP_400_BAD_REQUEST)

#         if User.objects.filter(email=email).exists():
#             return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

#         if User.objects.filter(phone=phone).exists():
#             return Response({"error": "Phone number already exists"}, status=status.HTTP_400_BAD_REQUEST)

#         # Create user in 'pending' status
#         user = User.objects.create(
#             username=f"pending_{email}",   # temp username until approved
#             email=email,
#             first_name=first_name,
#             last_name=last_name,
#             role="admin",  # set role
#             is_active=False,  # cannot login yet
#             application_status="pending"
#         )

#         # Save entrepreneur-specific fields
#         user.phone = phone
#         user.address_line1 = address
#         user.date_of_birth = date_of_birth
#         user.company_name = company_name
#         user.save()

#         # Check OTP verification
#         if not user.sms_verified:
#             return Response({
#                 "warning": "SMS verification pending. Please verify your phone number.",
#                 "application_id": user.id,
#                 "status": user.application_status
#             }, status=status.HTTP_202_ACCEPTED)

#         if not user.email_verified:
#             return Response({
#                 "warning": "Email verification pending. Please verify your email.",
#                 "application_id": user.id,
#                 "status": user.application_status
#             }, status=status.HTTP_202_ACCEPTED)

#         return Response({
#             "success": "Application submitted successfully. Wait for admin approval.",
#             "application_id": user.id,
#             "status": user.application_status
#         }, status=status.HTTP_201_CREATED)

#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Endpoint: Register Entrepreneur
@api_view(['POST'])
@permission_classes([AllowAny])
def register_entrepreneur(request):
    try:
        data = request.data

        # Collect entrepreneur details
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        phone = data.get("phone")
        address = data.get("address")
        date_of_birth = data.get("date_of_birth")
        company_name = data.get("company_name")
        password = data.get("password")  # <-- new password field

        # Basic validation
        if not first_name or not last_name or not email or not phone or not password:
            return Response(
                {"error": "First name, last name, email, phone and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone=phone).exists():
            return Response({"error": "Phone number already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create user in 'pending' status
        user = User.objects.create(
            username=f"pending_{email}",   # temp username until approved
            email=email,
            first_name=first_name,
            last_name=last_name,
            role="admin",  # set role
            is_active=False,  # cannot login yet
            application_status="pending"
        )

        # Set hashed password
        user.set_password(password)

        # Save entrepreneur-specific fields
        user.phone = phone
        user.address_line1 = address
        user.date_of_birth = date_of_birth
        user.company_name = company_name
        user.save()

        # Check OTP/email verification
        if not user.sms_verified:
            return Response({
                "warning": "SMS verification pending. Please verify your phone number.",
                "application_id": user.id,
                "status": user.application_status
            }, status=status.HTTP_202_ACCEPTED)

        if not user.email_verified:
            return Response({
                "warning": "Email verification pending. Please verify your email.",
                "application_id": user.id,
                "status": user.application_status
            }, status=status.HTTP_202_ACCEPTED)

        return Response({
            "success": "Application submitted successfully. Wait for admin approval.",
            "application_id": user.id,
            "status": user.application_status
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Endpoint: Sign In
@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request): 
    try:
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user by username/email
        user = User.objects.filter(username=username).first()

        if user is None or not check_password(password, user.password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
        # Check if account is active
        if not user.is_active:
            return Response({"error": "Account is disabled. Contact Adinvoice Support Team."}, status=status.HTTP_403_FORBIDDEN)

        # Entrepreneurs must be approved
        if user.role == "admin" and user.application_status != "approved":
            return Response({"error": f"Application {user.application_status}. Please wait for approval."}, status=status.HTTP_403_FORBIDDEN)
        
        tenant = Tenant.objects.get(owner_id=user.id)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "success": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "user_id": user.id,
            "tenant_id": tenant.id,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# Endpoint: Approve/Reject Entrepreneur Application
@api_view(['PUT'])
# @role_required(["admin"])
@permission_classes([AllowAny])
def approve_entrepreneur(request, user_id):
    try:
        action = request.data.get("action")  # "approve" or "reject"

        try:
            user = User.objects.get(id=user_id, role="admin")
        except User.DoesNotExist:
            return Response({"error": "Entrepreneur not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "approve":
            # Generate username & password
            base_username = user.email.split("@")[0]
            user.username = f"{base_username}_{user.id}"

            # Generate random password
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
            user.password = make_password(random_password)

            # Activate account
            user.application_status = "approved"
            user.is_active = True
            user.save()

            # TODO: Send credentials via email/SMS here

            return Response({
                "success": "Entrepreneur approved successfully",
                "username": user.username,
                "temp_password": random_password,
                "status": user.application_status
            }, status=status.HTTP_200_OK)

        elif action == "reject":
            user.application_status = "rejected"
            user.is_active = False
            user.save()
            return Response({"success": "Entrepreneur application rejected"}, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Invalid action. Use 'approve' or 'reject'."},
                            status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_company_details(request, user_id=None):
    try:
        # Determine user
        if user_id:
            try:
                user = User.objects.get(id=user_id, role="entrepreneur")
            except User.DoesNotExist:
                return Response({"error": "Entrepreneur not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user

        # GET: return company data
        company_data = {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "alternate_phone": user.alternate_phone,
            "date_of_birth": user.date_of_birth,
            "company_name": user.company_name,
            "designation": user.designation,
            "industry": user.industry,
            "experience_years": user.experience_years,
            "address": {
                "line1": user.address_line1,
                "line2": user.address_line2,
                "city": user.city,
                "state": user.state,
                "country": user.country,
                "pincode": user.pincode,
            },
            "website": user.website,
            "linkedin_profile": user.linkedin_profile,
            "twitter_profile": user.twitter_profile,
            "application_status": user.application_status,
            "email_verified": user.email_verified,
            "sms_verified": user.sms_verified,
            "profile_completed": user.profile_completed,
        }

        # Fetch uploaded documents
        docs = Document.objects.filter(user=user)
        company_data["documents"] = [
            {
                "id": doc.id,
                "doc_type": doc.get_doc_type_display(),
                "file_url": doc.document_file.url if doc.document_file else None,
                "is_verified": doc.is_verified,
                "uploaded_at": doc.uploaded_at
            }
            for doc in docs
        ]

        return Response(company_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_company_details(request):
    try:
        user = request.user

        # Fields allowed to update
        editable_fields = [
            "company_name", "phone", "alternate_phone", "date_of_birth",
            "designation", "industry", "experience_years",
            "address_line1", "address_line2", "city", "state",
            "country", "pincode", "website", "linkedin_profile",
            "twitter_profile"
        ]

        for field in editable_fields:
            if field in request.data:
                setattr(user, field, request.data[field])

        user.save()
        return Response({"message": "Company details updated successfully!"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_documents(request):
    docs = Document.objects.filter(user=request.user)
    serializer = DocumentSerializer(docs, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    file_obj = request.FILES.get("document_file")
    doc_type = request.data.get("doc_type")

    if not file_obj or not doc_type:
        return Response({"error": "document_file and doc_type are required"}, status=status.HTTP_400_BAD_REQUEST)

    document = Document.objects.create(
        user=request.user,
        doc_type=doc_type,
        document_file=file_obj,
    )

    serializer = DocumentSerializer(document, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_document(request, doc_id):
    print("Received doc_id:", doc_id)
    try:
        document = Document.objects.get(id=doc_id, user=request.user)
        document.delete()
        return Response({"message": "Document deleted successfully"}, status=status.HTTP_200_OK)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def pending_users(request):
    try:

        pending_user = User.objects.filter(application_status="pending").all()
     
        serializer = UserSerializer(pending_user, many=True)

        if not pending_user:
            return Response({"error":"user not found"})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
