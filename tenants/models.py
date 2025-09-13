from django.db import models, connections
from django.db.utils import OperationalError
import uuid

class Tenant(models.Model):
    name = models.CharField(max_length=255, unique=True)
    db_name = models.CharField(max_length=255, unique=True, blank=True, null=True)
    owner = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="owned_tenants")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ✅ Enable/Disable tenant
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        is_new = self._state.adding  # check if creating
        if not self.db_name:
            suffix = str(uuid.uuid4().int)[:6]
            safe_name = self.name.lower().replace(" ", "_")
            self.db_name = f"{safe_name}_{suffix}"

        super().save(*args, **kwargs)

        if is_new:
            try:
                with connections['default'].cursor() as cursor:
                    cursor.execute(f"CREATE DATABASE `{self.db_name}`")
            except OperationalError:
                pass

    def __str__(self):
        return f"{self.name} ({self.db_name})"
