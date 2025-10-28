import traceback

from django.conf import settings
from tenants.db_utils import get_tenant_db
from tenants.serializers import TenantSerializer
from tenants.models import Tenant
from users.serializers import UserSerializer
from django.contrib.auth.hashers import check_password

from utils.decorators import permission_required
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
from django.core.mail import send_mail




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

        # Basic validation
        if not first_name or not last_name or not email or not phone:
            return Response(
                {"error": "First name, last name, email and phone are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone=phone).exists():
            return Response({"error": "Phone number already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create user with inactive status - WITHOUT password
        user = User.objects.create(
            username=f"pending_{email}",
            email=email,
            first_name=first_name,
            last_name=last_name,
            role="admin",  # merchant role
            is_active=False,
            application_status="pending"
        )

        # Save other user fields
        user.phone = phone
        user.address_line1 = address
        user.date_of_birth = date_of_birth
        user.company_name = company_name
        user.save()

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
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Username/Email and Password required"}, status=400)

        # ✅ Try login using username OR email
        user = User.objects.filter(username=username_or_email).first()
        if not user:
            user = User.objects.filter(email=username_or_email).first()

        if not user:
            return Response({"error": "User not found"}, status=401)

        # ✅ Check password correctly
        if not check_password(password, user.password):
            return Response({"error": "Invalid credentials"}, status=401)

        if not user.is_active:
            return Response({"error": "Account is disabled"}, status=403)

        if user.role == "admin" and user.application_status != "approved":
            return Response({"error": f"Application {user.application_status}"}, status=403)

        tenant = Tenant.objects.filter(owner_id=user.id).first()
        if not tenant:
            return Response({"error": "Tenant not found"}, status=404)

        refresh = RefreshToken.for_user(user)

        return Response({
            "success": True,
            "message": "Login successful✅",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "user_id": user.id,
            "tenant_id": tenant.id,
            "username": user.username,
        }, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# Endpoint: Approve/Reject Entrepreneur Application
@api_view(['PUT'])
<<<<<<< HEAD
# @permission_required("approve_entrepreneur")
=======
>>>>>>> af9138201a181788863c89ef0e04ce08b1559006
@permission_classes([AllowAny])
def approve_entrepreneur(request, user_id):
    try:
        action = request.data.get("action")

        try:
            user = User.objects.get(id=user_id, role="admin")
        except User.DoesNotExist:
            return Response({"error": "Entrepreneur not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "approve":
            # ✅ Generate username
            base_username = user.email.split("@")[0]
            user.username = f"{base_username}_{user.id}"

            # ✅ Generate password
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
            user.password = make_password(random_password)

            # ✅ Approve user
            user.application_status = "approved"
            user.is_active = True
            user.save()

            # ✅ Create Tenant Automatically
            tenant_name = user.company_name if hasattr(user, "company_name") else user.first_name or user.email
            Tenant.objects.create(
                name=tenant_name,
                owner=user
            )

            # ✅ Send Email
            subject = "Your Merchant Account is Approved ✅"
            message = f"""
Hi {user.first_name},

✅ Your merchant account has been approved!

Here are your login details:
Username: {user.username}
Temporary Password: {random_password}

📌 Please change your password after login.

Best Regards,
AdInvoice Team
"""

            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

            return Response({
                "success": "Entrepreneur approved, tenant created & email sent",
                "username": user.username,
                "temp_password": random_password
            }, status=status.HTTP_200_OK)

        elif action == "reject":
            user.application_status = "rejected"
            user.is_active = False
            user.save()
            return Response({"success": "Entrepreneur rejected"}, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
# @permission_required("get_company_details")
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
# @permission_required("update_company_details")
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
# @permission_required("list_documents")
def list_documents(request):
    docs = Document.objects.filter(user=request.user)
    serializer = DocumentSerializer(docs, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
# @permission_required("upload_document")
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
# @permission_required("delete_document")
def delete_document(request, doc_id):
    print("Received doc_id:", doc_id)
    try:
        document = Document.objects.get(id=doc_id, user=request.user)
        document.delete()
        return Response({"message": "Document deleted successfully"}, status=status.HTTP_200_OK)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
# @permission_required("pending_users")
def pending_users(request):
    try:

        pending_user = User.objects.filter(application_status="pending").all()
     
        serializer = UserSerializer(pending_user, many=True)

        if not pending_user:
            return Response({"error":"user not found"})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def superadmin_login(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                "success": False,
                "error": "Email and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=email, password=password)
        if user is None:
            return Response({
                "success": False,
                "error": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_superuser:
            return Response({
                "success": False,
                "error": "You are not authorized to access this panel"
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "username": user.username,
            "is_superuser": user.is_superuser
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("❌ Super Admin login error:", str(e))
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
# @permission_required("merchant_list")
def merchant_list(request):
    try:
        tenants = Tenant.objects.select_related("owner").all()  # fetch tenants + owner in one query

        serializer = TenantSerializer(tenants, many=True)
        print(serializer.data)  # ✅ here you'll get tenant data + owner/user data
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    




# -----------------------------------------------------------
# 🧩 ROLE & PERMISSION MANAGEMENT
# -----------------------------------------------------------
# views.py
import logging
from .models import Role, Permission, UserRole, RolePermission
from .serializers import UserSerializer, RoleSerializer, PermissionSerializer, UserRoleSerializer, RolePermissionSerializer

logger = logging.getLogger(__name__)


# ---------------- Users ----------------



@api_view(["GET"])
@permission_classes([IsAuthenticated])
# @permission_required("user_list")
def user_list(request, tenant_id):
    """List all users for a tenant."""
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        users = User.objects.using(db_alias).all().values("id", "username", "email", "first_name", "last_name")
        result = []

        for u in users:
            roles = (
                Role.objects.using(db_alias)
                .filter(user_roles__user_id=u["id"])   # 👈 FIXED HERE
                .values("id", "name")
            )

            result.append({
                **u,
                "roles": list(roles)
            })

        return Response({"results": result}, status=status.HTTP_200_OK)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in user_list: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
# @permission_required("user_create")
def user_create(request, tenant_id):
    """Create a user in a tenant DB and assign roles."""
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        role_ids = data.get("role_ids", [])

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Create user in tenant DB
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save(using=db_alias)
        # ✅ Assign roles (via UserRole table)
        if isinstance(role_ids, list) and role_ids:
            for role_id in role_ids:
                try:
                    role = Role.objects.using(db_alias).get(id=role_id)
                    UserRole.objects.using(db_alias).create(user=user, role=role)
                except Role.DoesNotExist:
                    logger.warning(f"Role ID {role_id} not found in tenant {tenant_id}, skipped")

        # ✅ Fetch roles for response
        roles = (
            Role.objects.using(db_alias)
            .filter(user_roles__user_id=user.id)   # 👈 FIXED HERE TOO
            .values("id", "name")
        )



        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "roles": list(roles),
            },
            status=status.HTTP_201_CREATED,
        )

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in user_create: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(["PUT"])
@permission_classes([IsAuthenticated])
# @permission_required("user_update")
def user_update(request, user_id):
    """Update user details and roles for a given tenant (no serializer)."""
    try:
        logger.info(f"PUT data: {request.data}")

        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response(
                {"error": "Tenant ID required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        user = User.objects.using(db_alias).get(id=user_id)

        # --- Extract fields from request ---
        username = request.data.get("username", user.username)
        email = request.data.get("email", user.email)
        first_name = request.data.get("first_name", user.first_name)
        last_name = request.data.get("last_name", user.last_name)
        password = request.data.get("password", None)
        role_ids = request.data.get("role_ids", [])

        # --- Check for unique username conflict ---
        if (
            User.objects.using(db_alias)
            .exclude(id=user.id)
            .filter(username=username)
            .exists()
        ):
            return Response(
                {"error": "A user with that username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- Update basic fields ---
        user.username = username
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        if password:
            user.set_password(password)

        user.save(using=db_alias)

        # --- Update roles ---
        if isinstance(role_ids, list):
            UserRole.objects.using(db_alias).filter(user=user).delete()
            for role_id in role_ids:
                try:
                    role = Role.objects.using(db_alias).get(id=role_id)
                    UserRole.objects.using(db_alias).create(user=user, role=role)
                except Role.DoesNotExist:
                    logger.warning(
                        f"Role ID {role_id} not found for tenant {tenant_id}"
                    )

        # --- Fetch updated roles for response ---
        roles = (
            Role.objects.using(db_alias)
            .filter(user_roles__user_id=user.id)
            .values("id", "name")
        )

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "roles": list(roles),
            },
            status=status.HTTP_200_OK,
        )

    except Tenant.DoesNotExist:
        return Response(
            {"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST
        )
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in user_update: {str(e)}", exc_info=True)
        return Response(
            {"error": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )





@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
# @permission_required("user_delete")
def user_delete(request, user_id):
    try:
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID required"}, status=status.HTTP_400_BAD_REQUEST)
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)
        user = User.objects.using(db_alias).get(id=user_id)
        user.delete(using=db_alias)
        return Response({"message": "Deleted"}, status=status.HTTP_200_OK)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in user_delete: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Roles ----------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
# @permission_required("role_list")
def role_list(request, tenant_id):
    """List all roles for a tenant without serializer."""
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        # ✅ Fetch all roles from the tenant DB
        roles = Role.objects.using(db_alias).all()

        # ✅ Prepare response with permissions (via RolePermission)
        role_data = []
        for role in roles:
            # Fetch linked permissions via RolePermission table
            role_permissions = RolePermission.objects.using(db_alias).filter(role=role).select_related("permission")

            permissions = [
                {
                    "id": rp.permission.id,
                    "code": rp.permission.code,
                    "description": rp.permission.description,
                }
                for rp in role_permissions
            ]

            role_data.append({
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "permissions": permissions,
            })

        return Response(role_data, status=status.HTTP_200_OK)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in role_list: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
# @permission_required("role_create")
def role_create(request, tenant_id):
    try:
        # 1️⃣ Get tenant and correct database alias
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        data = request.data
        name = data.get("name")
        description = data.get("description", "")
        permission_ids = data.get("permission_ids", [])

        if not name:
            return Response(
                {"error": "Role name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2️⃣ Create the Role in tenant DB
        role = Role.objects.using(db_alias).create(
            name=name,
            description=description,
        )

        # 3️⃣ Attach permissions manually via RolePermission
        permissions = []
        if permission_ids:
            permissions = Permission.objects.using(db_alias).filter(id__in=permission_ids)
            if permissions.count() != len(permission_ids):
                return Response(
                    {"error": "Some permission IDs not found in tenant DB"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create RolePermission records in tenant DB
            role_permissions = [
                RolePermission(role_id=role.id, permission_id=p.id)
                for p in permissions
            ]
            RolePermission.objects.using(db_alias).bulk_create(role_permissions)

        # 4️⃣ Prepare response
        return Response(
            {
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "permissions": list(permissions.values("id", "code"))
                if permissions
                else [],
            },
            status=status.HTTP_201_CREATED,
        )

    except Tenant.DoesNotExist:
        return Response(
            {"error": "Tenant not found"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.error(f"Error in role_create: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )



@api_view(["PUT"])
@permission_classes([IsAuthenticated])
# @permission_required("role_update")
def role_update(request, role_id):
    tenant_id = request.data.get("tenant")
    if not tenant_id:
        return Response({"error": "Tenant ID required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        # Get role from tenant DB
        role = Role.objects.using(db_alias).get(id=role_id)

        # Update role name
        role_name = request.data.get("name")
        if role_name:
            role.name = role_name
            role.save(using=db_alias)

        # Update permissions
        permission_ids = request.data.get("permission_ids", [])
        if isinstance(permission_ids, list):
            RolePermission.objects.using(db_alias).filter(role=role).delete()

            for pid in permission_ids:
                try:
                    permission = Permission.objects.using(db_alias).get(id=pid)
                    RolePermission.objects.using(db_alias).create(role=role, permission=permission)
                except Permission.DoesNotExist:
                    logger.warning(f"Permission ID {pid} not found in tenant {tenant_id}, skipped")

        # Fetch updated permissions
        permissions = list(
            RolePermission.objects.using(db_alias)
            .filter(role=role)
            .select_related("permission")
            .values("permission__id", "permission__code", "permission__description")
        )

        return Response(
            {
                "id": role.id,
                "name": role.name,
                "permissions": permissions,
            },
            status=status.HTTP_200_OK,
        )

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Role.DoesNotExist:
        return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in role_update: {str(e)}", exc_info=True)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    



@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
# @permission_required("role_delete")
def role_delete(request, role_id):
    tenant_id = request.query_params.get("tenant")  # Pass tenant via query param
    if not tenant_id:
        return Response({"error": "Tenant ID required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)
        role = Role.objects.using(db_alias).get(id=role_id)
        role.delete(using=db_alias)
        return Response({"message": "Deleted"}, status=status.HTTP_200_OK)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Role.DoesNotExist:
        return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in role_delete: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# ---------------- Permissions ----------------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def permission_list_create(request):
    tenant_id = request.GET.get("tenant") or request.data.get("tenant")
    if not tenant_id:
        return Response({"error": "Tenant ID required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        if request.method == "GET":
            perms = Permission.objects.using(db_alias).all()
            serializer = PermissionSerializer(perms, many=True, context={"using": db_alias})
            return Response(serializer.data)

        elif request.method == "POST":
            serializer = PermissionSerializer(data=request.data, context={"using": db_alias})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in permission_list_create: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def permission_update_delete(request, perm_id):
    tenant_id = request.data.get("tenant")
    if not tenant_id:
        return Response({"error": "Tenant ID required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)
        perm = Permission.objects.using(db_alias).get(id=perm_id)

        if request.method == "PUT":
            serializer = PermissionSerializer(perm, data=request.data, context={"using": db_alias})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "DELETE":
            perm.delete(using=db_alias)
            return Response({"message": "Deleted"}, status=status.HTTP_200_OK)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Permission.DoesNotExist:
        return Response({"error": "Permission not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in permission_update_delete: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ---------------- Assign Role ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_role_to_user(request):
    try:
        tenant_id = request.data.get("tenant")
        user_id = request.data.get("user_id")
        role_id = request.data.get("role_id")
        if not all([tenant_id, user_id, role_id]):
            return Response({"error": "tenant, user_id, role_id required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        user = User.objects.using(db_alias).get(id=user_id)
        role = Role.objects.using(db_alias).get(id=role_id)

        user_role, created = UserRole.objects.using(db_alias).get_or_create(user=user, role=role)
        serializer = UserRoleSerializer(user_role)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Role.DoesNotExist:
        return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in assign_role_to_user: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    



# ---------------- Assign Permission ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_permission_to_role(request):
    try:
        tenant_id = request.data.get("tenant")
        role_id = request.data.get("role_id")
        permission_id = request.data.get("permission_id")
        if not all([tenant_id, role_id, permission_id]):
            return Response({"error": "tenant, role_id, permission_id required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        role = Role.objects.using(db_alias).get(id=role_id)
        permission = Permission.objects.using(db_alias).get(id=permission_id)

        rp, created = RolePermission.objects.using(db_alias).get_or_create(role=role, permission=permission)
        serializer = RolePermissionSerializer(rp)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except Role.DoesNotExist:
        return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
    except Permission.DoesNotExist:
        return Response({"error": "Permission not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in assign_permission_to_role: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- User Roles & Permissions ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_roles_permissions(request, user_id):
    try:
        tenant_id = request.GET.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        user = User.objects.using(db_alias).get(id=user_id)
        roles = Role.objects.using(db_alias).filter(user_roles__user=user)
        permissions = Permission.objects.using(db_alias).filter(role_permissions__role__user_roles__user=user).distinct()

        data = {
            "user": user.username,
            "roles": [r.name for r in roles],
            "permissions": [p.code for p in permissions],
        }
        return Response(data)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in user_roles_permissions: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)