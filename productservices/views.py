import traceback
from tenants.db_utils import get_tenant_db
from tenants.models import Tenant
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Category, ProductService
from .serializers import CategorySerializer, ProductServiceSerializer


# ✅ Create Product/Service
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_product_service(request):
    try:
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        db_alias = get_tenant_db(tenant)

        data = request.data.copy()
        serializer = ProductServiceSerializer(
            data=data,
            context={
                "tenant": tenant,
                "db_alias": db_alias,
                "request": request
            }
        )

        if serializer.is_valid():
            product_service = serializer.save()
            return Response({
                "success": "Product/Service created successfully",
                "item": ProductServiceSerializer(product_service).data
            }, status=status.HTTP_201_CREATED)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ✅ Get Entrepreneur's Products/Services
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_products_services(request):
    try:
        user = request.user

        if user.role != "entrepreneur":
            return Response(
                {"error": "Only entrepreneurs can view their products or services."},
                status=status.HTTP_403_FORBIDDEN
            )

        items = ProductService.objects.filter(entrepreneur=user, tenant=user.tenant)
        serializer = ProductServiceSerializer(items, many=True)

        return Response({
            "success": "Products/Services fetched successfully",
            "count": items.count(),
            "items": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Update Product/Service
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_product_service(request, pk):
    try:
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔹 Get tenant and db alias
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        db_alias = get_tenant_db(tenant)

        # 🔹 Fetch product from tenant DB
        try:
            item = ProductService.objects.using(db_alias).get(id=pk)
        except ProductService.DoesNotExist:
            return Response(
                {"error": "Product/Service not found in tenant DB"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔹 Update with serializer
        serializer = ProductServiceSerializer(
            item, 
            data=request.data, 
            context={"db_alias": db_alias, "tenant": tenant, "request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": "Product/Service updated successfully",
                "item": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Delete Product/Service
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_service(request, pk):
    try:
        user = request.user
        try:
            item = ProductService.objects.get(id=pk, entrepreneur=user, tenant=user.tenant)
        except ProductService.DoesNotExist:
            return Response(
                {"error": "Product/Service not found or unauthorized"},
                status=status.HTTP_404_NOT_FOUND
            )

        item.delete()
        return Response({"success": "Product/Service deleted successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
