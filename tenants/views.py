import traceback
from copy import deepcopy
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from users.models import User
from .models import Tenant
from .serializers import TenantSerializer, TenantsSerializer
from utils.decorators import permission_required
from django.conf import settings
from django.core.management import call_command
from django.db import connections, connection



# Endpoint: Create Tenant (Admin only)
@api_view(['POST'])
# @permission_required("create_tenant")
def create_tenant(request):
    serializer = TenantsSerializer(data=request.data)
    if serializer.is_valid():
        tenant = serializer.save()

        # Copy default DB settings
        new_db_config = deepcopy(settings.DATABASES["default"])
        new_db_config["NAME"] = tenant.db_name

        # Register new DB
        settings.DATABASES[tenant.db_name] = new_db_config

        # Run migrations for tenant DB
        call_command("migrate", database=tenant.db_name, interactive=False)

        return Response(
            {"success": f"Tenant {tenant.name} created with DB {tenant.db_name}"},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# Endpoint: List Tenants (Admin & Staff can view)
@api_view(['GET'])
@permission_required("list_tenant")
def list_tenants(request):
    try:
        tenants = Tenant.objects.all()

        serializer = TenantSerializer(tenants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# Endpoint: Retrieve Tenant (Admin & Staff)
@api_view(['GET'])
@permission_required("get_tenant")
def get_tenant(request, tenant_id):
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        serializer = TenantSerializer(tenant)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['PUT'])
@permission_required("update_tenant")
def update_tenant(request, tenant_id):
    try:
        tenant = Tenant.objects.get(id=tenant_id)

        # ✅ Handle enable/disable (approve/reject)
        if "action" in request.data:
            action = request.data.get("action")

            if action == "disable":
                tenant.is_active = False
                tenant.save()
                return Response(
                    {"success": "Tenant disabled successfully", "data": {"id": tenant.id, "is_active": tenant.is_active}},
                    status=status.HTTP_200_OK,
                )
            elif action == "enable":
                tenant.is_active = True
                tenant.save()
                return Response(
                    {"success": "Tenant enabled successfully", "data": {"id": tenant.id, "is_active": tenant.is_active}},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response({"error": "Invalid action. Use 'enable' or 'disable'."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Normal update (without touching db_name)
        serializer = TenantSerializer(tenant, data=request.data, partial=True)
        if serializer.is_valid():
            if "db_name" in serializer.validated_data:
                serializer.validated_data.pop("db_name")

            serializer.save()
            return Response({"success": "Tenant updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Endpoint: Delete Tenant (Admin only)
@api_view(['DELETE'])
# @permission_required("delete_tenant")
def delete_tenant(request, tenant_id):
    try:
        tenant = Tenant.objects.get(id=tenant_id)

        db_name = tenant.db_name  # keep before deleting the object

        # 1. Drop the tenant's database
        with connection.cursor() as cursor:
            cursor.execute(f"DROP DATABASE IF EXISTS `{db_name}`")

        # 2. Delete tenant record
        tenant.delete()

        return Response(
            {"success": f"Tenant '{tenant.name}' and database '{db_name}' deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)