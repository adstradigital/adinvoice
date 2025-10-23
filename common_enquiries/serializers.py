from rest_framework import serializers
from .models import CommonEnquiry

class CommonEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonEnquiry
        fields = "__all__"  # Includes status and timestamps
