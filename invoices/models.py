from django.db import models
from tenants.models import Tenant
from users.models import User

class Proposal(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    client_name = models.CharField(max_length=255)
    details = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=[("draft", "Draft"), ("sent", "Sent"), ("accepted", "Accepted")])
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    client_name = models.CharField(max_length=255)
    issue_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=[("unpaid", "Unpaid"), ("paid", "Paid")])
    created_at = models.DateTimeField(auto_now_add=True)

class Receipt(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
