from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q

from adinvoice import settings

class Tenant(models.Model):
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('UPDATE', 'Update'),
        ('ANNOUNCEMENT', 'Announcement'),
    ]
    SENDER_TYPE_CHOICES = [
        ('SUPER_ADMIN', 'Super Admin'),
        ('CLIENT_ADMIN', 'Client Admin'),
    ]

    sender_type = models.CharField(max_length=20, choices=SENDER_TYPE_CHOICES)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    message = models.TextField()
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.CASCADE)  # Null = global
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.message[:50]}"

class NotificationRead(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('notification', 'user')
