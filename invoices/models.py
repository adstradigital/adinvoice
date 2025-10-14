from django.db import models
from tenants.models import Tenant
from users.models import User
import uuid
from django.utils import timezone

class Proposal(models.Model):
    PROPOSAL_STATUS = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE,)
    proposal_number = models.CharField(max_length=100, unique=True, blank=True)
    title = models.CharField(max_length=255,null=True)
    
    # Client Information
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField(blank=True)
    client_phone = models.CharField(max_length=20, blank=True)
    client_address = models.TextField(blank=True)
    
    # Company Information
    company_name = models.CharField(max_length=255, blank=True)
    company_email = models.EmailField(blank=True)
    company_phone = models.CharField(max_length=20, blank=True)
    company_address = models.TextField(blank=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    
    # Proposal Details
    date = models.DateField(default=timezone.now)
    due_date = models.DateField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_gst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=PROPOSAL_STATUS, default='draft')
    template = models.CharField(max_length=50, default='classic')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.proposal_number:
            timestamp = timezone.now().strftime('%Y%m%d')
            import random
            random_num = random.randint(1000, 9999)
            self.proposal_number = f"PROP-{timestamp}-{random_num}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.proposal_number} - {self.client_name}"

class ProposalItem(models.Model):
    ITEM_TYPES = [
        ('service', 'Service'),
        ('product', 'Product'),
        ('hourly', 'Hourly Service'),
        ('fixed', 'Fixed Price')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proposal = models.ForeignKey(Proposal, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    item_type = models.CharField(max_length=50, choices=ITEM_TYPES, default='service')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, default='pc')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        # Calculate total including GST
        base_amount = self.quantity * self.price
        gst_amount = base_amount * (self.gst_rate / 100)
        self.total = base_amount + gst_amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.proposal.proposal_number}"

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
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
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

class Receipt(models.Model):
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('online', 'Online Payment')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='receipts')
    receipt_number = models.CharField(max_length=100, unique=True, blank=True)
    payment_date = models.DateField(default=timezone.now)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    # Bank details for transfer/cheque
    bank_name = models.CharField(max_length=255, blank=True)
    cheque_number = models.CharField(max_length=100, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            timestamp = timezone.now().strftime('%Y%m%d')
            import random
            random_num = random.randint(1000, 9999)
            self.receipt_number = f"RCP-{timestamp}-{random_num}"
        
        # Update invoice payment status
        if self.amount_paid > 0:
            self.invoice.amount_paid += self.amount_paid
            self.invoice.save()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.receipt_number} - {self.invoice.invoice_number}"