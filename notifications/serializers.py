# serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'message',
            'notification_type',
            'sender_type',
            'tenant_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'sender_type', 'tenant_name']

    def get_tenant_name(self, obj):
        return obj.tenant.name if obj.tenant else 'All'
