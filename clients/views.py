from django.shortcuts import render
from tenants.db_utils import get_tenant_db
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from tenants.models import Tenant
from .models import ClientCompany
from .serializers import ClientCompanySerializer
from django.db import IntegrityError





# Endpoint: Create Client Company
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_client_company(request):
    tenant_id = request.data.get("tenant")
    if not tenant_id:
        return Response({"error": "Tenant ID is required"}, status=400)

    try:
        tenant = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=404)

    db_alias = get_tenant_db(tenant)

    client_name = request.data.get("name")
    if ClientCompany.objects.using(db_alias).filter(name__iexact=client_name).exists():
        return Response({"error": "Client company with this name already exists"}, status=400)

    serializer = ClientCompanySerializer(data=request.data)
    if serializer.is_valid():
        company = ClientCompany.objects.using(db_alias).create(**serializer.validated_data)
        return Response({"success": "Client company created", "data": {"id": company.id, "name": company.name}}, status=201)
    
    print(serializer.errors)
    return Response(serializer.errors, status=400)




# Endpoint: List All Clients
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_client_companies(request, tenant):
    if not tenant:
        return Response({"error": "Tenant ID is required"}, status=400)

    try:
        tenant = Tenant.objects.get(id=tenant)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant/Database not found"}, status=404)

    db_alias = get_tenant_db(tenant)

    clients = ClientCompany.objects.using(db_alias).all()

    if not clients:
        return Response({"error":"Clients not founded"})

    serializer = ClientCompanySerializer(clients, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)





# Endpoint: Update Client (with tenant support)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_client_company(request, client_id):
    tenant_id = request.data.get("tenant")

    if not tenant_id:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        tenant_obj = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant/Database not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get tenant DB alias
    db_alias = get_tenant_db(tenant_obj)

    try:
        client = ClientCompany.objects.using(db_alias).get(id=client_id)
    except ClientCompany.DoesNotExist:
        return Response({"error": "Client company not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClientCompanySerializer(client, data=request.data, partial=True, context={"using": db_alias})
    if serializer.is_valid():
        # Force save on the correct DB
        client = serializer.save()
        client.save(using=db_alias)
        return Response(
            {"success": "Client company updated", "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Endpoint: Delete Client (with tenant support)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_client_company(request, client_id):
    tenant_id = request.data.get("tenant")

    if not tenant_id:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tenant_obj = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant/Database not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get tenant DB alias
    db_alias = get_tenant_db(tenant_obj)

    try:
        client = ClientCompany.objects.using(db_alias).get(id=client_id)
    except ClientCompany.DoesNotExist:
        return Response({"error": "Client company not found"}, status=status.HTTP_404_NOT_FOUND)

    client.delete(using=db_alias)
    return Response({"success": "Client company deleted"}, status=status.HTTP_200_OK)




# Endpoint: Activate / Deactivate Client (with tenant support)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_client_status(request, client_id):
    tenant_id = request.data.get("tenant")

    if not tenant_id:
        return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tenant_obj = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant/Database not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get tenant DB alias
    db_alias = get_tenant_db(tenant_obj)

    try:
        client = ClientCompany.objects.using(db_alias).get(id=client_id)
    except ClientCompany.DoesNotExist:
        return Response({"error": "Client company not found"}, status=status.HTTP_404_NOT_FOUND)

    # Toggle active status
    client.is_active = not client.is_active
    client.save(using=db_alias)

    return Response({
        "success": f"Client company {'activated' if client.is_active else 'deactivated'}",
        "status": client.is_active
    }, status=status.HTTP_200_OK)
