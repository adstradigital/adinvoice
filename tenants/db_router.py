from .models import Tenant
from django.db import connections

class TenantRouter:
    def db_for_read(self, model, **hints):
        tenant = hints.get("tenant")
        if tenant:
            return tenant.db_name
        return "default"

    def db_for_write(self, model, **hints):
        tenant = hints.get("tenant")
        if tenant:
            return tenant.db_name
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return True