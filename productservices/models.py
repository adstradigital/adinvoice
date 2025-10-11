from django.db import models
from django.conf import settings


class Category(models.Model):
    """Product/Service categories (optional for filtering)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    


class ProductService(models.Model):
    """Products & Services offered by Entrepreneurs"""
    TYPE_CHOICES = [
        ("product", "Product"),
        ("service", "Service"),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # optional fields
    hsn_code = models.CharField(max_length=100, blank=True, null=True, unique=True)
    stock_quantity = models.PositiveIntegerField(default=0, null=True, blank=True)  # for products
    delivery_available = models.BooleanField(default=False)  # for services/products

    def __str__(self):
        return f"{self.name} ({self.type})"


class ProductServiceImage(models.Model):
    """Multiple images for each product/service"""
    item = models.ForeignKey(ProductService, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/%Y/%m/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.item.name}"
