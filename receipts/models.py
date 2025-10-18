# receipts/models.py
from django.db import models
from tenants.models import Tenant
from invoices.models import Invoice
import uuid

class Receipt(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
        ('Closed', 'Closed'),
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    receipt_number = models.CharField(max_length=50, null=True, blank=True)
    
    # Invoice Relationship
    invoice = models.ForeignKey('invoices.Invoice', on_delete=models.CASCADE, related_name='receipts', null=True, blank=True)
    
    # Receipt Details
    date = models.DateField()
    client_name = models.CharField(max_length=255, default="Unknown Client")
    client_email = models.EmailField(blank=True, null=True, default=None)
    description = models.TextField(blank=True, null=True, default="")
    
    # Amount Fields
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment Details
    due_date = models.DateField(blank=True, null=True, default=None)
    next_payment = models.DateField(blank=True, null=True, default=None)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Tenant relationship (EXACTLY LIKE PROPOSALS)
    # tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='receipts')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            # models.Index(fields=['receipt_number']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.receipt_number} - {self.client_name}"

    def save(self, *args, **kwargs):
        # Auto-calculate balance amount
        self.balance_amount = self.total_amount - self.paid_amount
        
        # Auto-update status based on amounts
        if self.balance_amount == 0:
            self.status = 'Closed'
        elif self.paid_amount == 0:
            self.status = 'Pending'
        elif self.paid_amount > 0 and self.paid_amount < self.total_amount:
            self.status = 'Partially Paid'
        elif self.paid_amount >= self.total_amount:
            self.status = 'Paid'
            
        super().save(*args, **kwargs)