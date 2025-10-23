from rest_framework import serializers
from support.models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    tenant = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = SupportTicket
        fields = ['id', 'subject', 'description', 'created_at','tenant']
