from users.models import User
from rest_framework import serializers
from .models import Category, ProductService, ProductServiceImage


class ProductServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductServiceImage
        fields = ["id", "image", "uploaded_at"]



class ProductServiceSerializer(serializers.ModelSerializer):
    images = ProductServiceImageSerializer(many=True, read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = ProductService
        fields = [
            "id", "type", "category", "name", "description", "price",
            "is_active", "sku", "stock_quantity", "delivery_available",
            "created_at", "updated_at", "images"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def __init__(self, *args, **kwargs):
        db_alias = kwargs.get("context", {}).get("db_alias", "default")
        super().__init__(*args, **kwargs)
        if db_alias:
            dd = Category.objects.using(db_alias).all()
            print([i for i in dd])
            self.fields["category"].queryset = Category.objects.using(db_alias).all()

    def create(self, validated_data):
        db_alias = self.context.get("db_alias", "default")
        # ✅ Just save in tenant DB; no FK to admin user
        return ProductService.objects.using(db_alias).create(**validated_data)


    

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]
