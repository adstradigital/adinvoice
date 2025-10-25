from rest_framework import serializers
from .models import InvoiceTemplate

class InvoiceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceTemplate
        fields = ['id', 'title', 'file', 'created_at', 'is_active']
