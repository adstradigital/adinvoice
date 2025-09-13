from django.conf import settings
from django.db import connections, DEFAULT_DB_ALIAS
from django.core.management import call_command

def create_database(db_name):
    """Create a new database for tenant"""
    with connections[DEFAULT_DB_ALIAS].cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")

    # Dynamically add tenant DB to settings
    settings.DATABASES[db_name] = {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': db_name,
        'USER': settings.DATABASES['default']['USER'],
        'PASSWORD': settings.DATABASES['default']['PASSWORD'],
        'HOST': settings.DATABASES['default']['HOST'],
        'PORT': settings.DATABASES['default']['PORT'],
    }

    # Run migrations on the new DB
    call_command("migrate", database=db_name, interactive=False, run_syncdb=True)


def drop_database(db_name):
    """Drop tenant database"""
    with connections[DEFAULT_DB_ALIAS].cursor() as cursor:
        cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")

    # Remove from settings to avoid dangling DB config
    if db_name in settings.DATABASES:
        del settings.DATABASES[db_name]
