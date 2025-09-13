from django.db import connections

def get_tenant_db(tenant):
    """
    Ensure tenant database is registered in connections.databases with all required keys.
    """
    db_alias = tenant.db_name
    if db_alias not in connections.databases:
        connections.databases[db_alias] = {
            "ENGINE": "django.db.backends.mysql",
            "NAME": tenant.db_name,
            "USER": "root",
            "PASSWORD": "root@123",
            "HOST": "127.0.0.1",
            "PORT": "3306",
            "OPTIONS": {"charset": "utf8mb4"},
            "TIME_ZONE": "UTC",
            "AUTOCOMMIT": True,
            "ATOMIC_REQUESTS": False,
            "CONN_MAX_AGE": 0,
            "CONN_HEALTH_CHECKS": True,
            "TEST": {"NAME": tenant.db_name},
        }
    return db_alias
