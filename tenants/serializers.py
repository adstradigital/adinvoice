from rest_framework import serializers
from django.contrib.auth import get_user_model
from tenants.models import Tenant

User = get_user_model()

class TenantOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone", "company_name", "role"]

class TenantSerializer(serializers.ModelSerializer):
    owner = TenantOwnerSerializer(read_only=True)  # nested owner info

    class Meta:
        model = Tenant
        fields = ["id", "name", "db_name", "is_active", "owner"]