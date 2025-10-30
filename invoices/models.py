from django.db import models
from proposal.models import Proposal
from tenants.models import Tenant
from users.models import User
import uuid
from django.utils import timezone


class Invoice(models.Model):
    INVOICE_STATUS = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
        ('partially_paid', 'Partially Paid')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='invoices',null=True)
    invoice_number = models.CharField(max_length=100, unique=True, blank=True)
    
    # Client Information (duplicated for record keeping)
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField(blank=True)
    client_phone = models.CharField(max_length=20, blank=True)
    client_address = models.TextField(blank=True)
    client_gstin = models.CharField(max_length=15, blank=True)
    
    # Company Information
    company_name = models.CharField(max_length=255, blank=True)
    company_email = models.EmailField(blank=True)
    company_phone = models.CharField(max_length=20, blank=True)
    company_address = models.TextField(blank=True)
    company_gstin = models.CharField(max_length=15, blank=True)
    
    # Invoice Details
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_gst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Additional Information
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=INVOICE_STATUS, default='draft')
    template_used = models.CharField(max_length=50, default='saffron')
    
    # Payment Information
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Soft Delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            timestamp = timezone.now().strftime('%Y%m%d')
            import random
            random_num = random.randint(1000, 9999)
            self.invoice_number = f"INV-{timestamp}-{random_num}"
        
        # Calculate balance due
        self.balance_due = self.grand_total - self.amount_paid
        
        # Auto-update status based on payment
        if self.amount_paid >= self.grand_total:
            self.status = 'paid'
        elif self.amount_paid > 0:
            self.status = 'partially_paid'
        elif self.due_date < timezone.now().date() and self.status not in ['paid', 'cancelled']:
            self.status = 'overdue'
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.client_name}"

class InvoiceItem(models.Model):
    ITEM_TYPES = [
        ('service', 'Service'),
        ('product', 'Product'),
        ('hourly', 'Hourly Service'),
        ('fixed', 'Fixed Price')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.TextField()
    item_type = models.CharField(max_length=50, choices=ITEM_TYPES, default='service')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, default='pc')
    
    # ✅ ADDED HSN/SAC AND PART/SERVICE CODE FIELDS
    hsn_sac = models.CharField(max_length=50, blank=True, verbose_name="HSN/SAC Code")
    part_service_code = models.CharField(max_length=50, blank=True, verbose_name="Part/Service Code")

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        # Calculate total including GST
        base_amount = self.quantity * self.price
        gst_amount = base_amount * (self.gst_rate / 100)
        self.total = base_amount + gst_amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"