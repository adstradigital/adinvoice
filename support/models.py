from django.db import models
from django.conf import settings
from tenants.models import Tenant  # your multi-tenant model

class SupportTicket(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    file = models.FileField(upload_to='support_files/', null=True, blank=True)
    status = models.CharField(max_length=20, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject
