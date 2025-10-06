from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Document

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"  # double underscores, as string


class DocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source="get_doc_type_display", read_only=True)
    document_file = serializers.SerializerMethodField()  # override to return full URL

    class Meta:
        model = Document
        fields = ["id", "doc_type", "doc_type_display", "document_file", "uploaded_at", "is_verified"]

    def get_document_file(self, obj):
        request = self.context.get("request")
        if obj.document_file:
            return request.build_absolute_uri(obj.document_file.url)  # full URL
        return ""