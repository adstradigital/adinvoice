from django.db import models
from django.conf import settings
from tenants.models import Tenant
import uuid

class Proposal(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    TEMPLATE_CHOICES = [
        (1, 'Classic'),
        (2, 'Modern'),
        (3, 'Professional'),
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    proposal_number = models.CharField(max_length=50)
    
    # Client Information
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField(blank=True, null=True)
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    client_address = models.TextField(blank=True, null=True)
    
    # Company Information
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField(blank=True, null=True)
    company_phone = models.CharField(max_length=20, blank=True, null=True)
    company_address = models.TextField(blank=True, null=True)
    company_logo = models.URLField(blank=True, null=True)
    
    # Proposal Details
    date = models.DateField()
    due_date = models.DateField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_gst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    
    # Status and Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    template = models.IntegerField(choices=TEMPLATE_CHOICES, default=1)
    
    # Tenant relationship
    # tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='proposals')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['proposal_number']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.proposal_number} - {self.client_name}"

class ProposalItem(models.Model):
    TYPE_CHOICES = [
        ('product', 'Product'),
        ('service', 'Service'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='items')
    
    # Item Details
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='product')
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Calculated fields
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']  # Simplified: only order by order field
    
    def save(self, *args, **kwargs):
        # Calculate total including GST
        subtotal = self.quantity * self.price
        gst_amount = subtotal * (self.gst_rate / 100)
        self.total = subtotal + gst_amount
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} - {self.proposal.proposal_number}"