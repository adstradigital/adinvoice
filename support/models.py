from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SupportTicket(models.Model):
    subject = models.CharField(max_length=255)
    description = models.TextField()
    file = models.FileField(upload_to='support_files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # merchant = models.ForeignKey(User, on_delete=models.CASCADE)  # Tenant user who submitted
    
    merchant = models.ForeignKey(User, on_delete=models.CASCADE, null=True)


    status = models.CharField(max_length=50, default='Pending')  # Pending / Resolved

    def __str__(self):
        return f"{self.subject} - {self.merchant.username}"
