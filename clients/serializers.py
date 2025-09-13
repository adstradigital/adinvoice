from rest_framework import serializers
from .models import ClientCompany

class ClientCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientCompany
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        # Get tenant DB alias from serializer context
        db_alias = self.context.get("db_alias", "default")
        # Use .using(db_alias) for multi-tenant save
        return ClientCompany.objects.using(db_alias).create(**validated_data)
