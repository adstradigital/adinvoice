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