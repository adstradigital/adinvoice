from .models import Role, Permission, UserRole, RolePermission
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Document
from tenants.serializers import TenantSerializer
from .models import Document
from tenants.models import Tenant



User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)  # nested tenant info

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "company_name",
            "role",
            "application_status",
            "tenant",
        ]


# -------------------------
# Document Serializer
# -------------------------
class DocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source="get_doc_type_display", read_only=True)
    document_file = serializers.SerializerMethodField()  # full URL

    class Meta:
        model = Document
        fields = ["id", "doc_type", "doc_type_display", "document_file", "uploaded_at", "is_verified"]

    def get_document_file(self, obj):
        request = self.context.get("request")
        if obj.document_file:
            return request.build_absolute_uri(obj.document_file.url)
        return ""


# -------------------------
# Merchant Serializer (Optional)
# -------------------------
class MerchantSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)  # include tenant info for merchants

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "is_active",
            "date_joined",
            "tenant",
        ]




# serializers.py
from .models import Role, Permission, UserRole, RolePermission





User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "roles","application_status",]

    def get_roles(self, obj):
        roles = obj.user_roles.all()
        return [role.role.name for role in roles]

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "code", "description"]
        extra_kwargs = {"code": {"validators": []}}

    def validate(self, attrs):
        db_alias = self.context.get("using", "default")
        code = attrs.get("code")
        if code:
            queryset = Permission.objects.using(db_alias).filter(code=code)
            if self.instance:
                queryset = queryset.exclude(id=self.instance.id)
            if queryset.exists():
                raise serializers.ValidationError({"code": ["Permission code already exists"]})
        return attrs

    def create(self, validated_data):
        db_alias = self.context.get("using", "default")
        return Permission.objects.using(db_alias).create(**validated_data)

    def update(self, instance, validated_data):
        db_alias = self.context.get("using", "default")
        instance.code = validated_data.get("code", instance.code)
        instance.description = validated_data.get("description", instance.description)
        instance.save(using=db_alias)
        return instance

class RoleSerializer(serializers.ModelSerializer):
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        source="permissions",
        queryset=Permission.objects.none(),
        write_only=True,
        required=False,
    )
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = ["id", "name", "permissions", "permission_ids"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        db_alias = self.context.get("using", "default")
        self.fields["permission_ids"].queryset = Permission.objects.using(db_alias).all()

    def validate_permission_ids(self, value):
        db_alias = self.context.get("using", "default")
        invalid_ids = [
            pid for pid in [p.id for p in value]
            if not Permission.objects.using(db_alias).filter(id=pid).exists()
        ]
        if invalid_ids:
            raise serializers.ValidationError(
                {"permission_ids": [f"Invalid pk \"{pid}\" - object does not exist." for pid in invalid_ids]}
            )
        return value

    def create(self, validated_data):
        db_alias = self.context.get("using", "default")
        permission_ids = validated_data.pop("permissions", [])
        role = Role.objects.using(db_alias).create(**validated_data)
        if permission_ids:
            permissions = Permission.objects.using(db_alias).filter(id__in=[p.id for p in permission_ids])
            role.permissions.set(permissions)
        return role

    def update(self, instance, validated_data):
        db_alias = self.context.get("using", "default")
        permission_ids = validated_data.pop("permissions", None)
        instance.name = validated_data.get("name", instance.name)
        instance.save(using=db_alias)
        if permission_ids is not None:
            permissions = Permission.objects.using(db_alias).filter(id__in=[p.id for p in permission_ids])
            instance.permissions.set(permissions)
        return instance

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = "__all__"

class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = "__all__"