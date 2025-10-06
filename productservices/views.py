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

        # Get tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Get DB alias dynamically (this will return main or copy DB depending on your get_tenant_db logic)
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
            # ✅ Save to the tenant's DB
            product_service = serializer.save()
            return Response({
                "success": "Product/Service created successfully",
                "item": ProductServiceSerializer(product_service).data
            }, status=status.HTTP_201_CREATED)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ✅ Get Entrepreneur's Products/Services
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_my_products_services(request):
    try:
        user = request.user

        # Optional: Check if user is entrepreneur
        # if user.role != "entrepreneur":
        #     return Response(
        #         {"error": "Only entrepreneurs can view their products or services."},
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        # 🔹 Get tenant ID from request body
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response(
                {"error": "Tenant ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔹 Fetch tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # 🔹 Get tenant DB alias
        db_alias = get_tenant_db(tenant)

        # 🔹 Fetch products/services from tenant DB
        items = ProductService.objects.using(db_alias).all()

        serializer = ProductServiceSerializer(
            items,
            many=True,
            context={"db_alias": db_alias, "tenant": tenant, "request": request}
        )

        return Response({
            "success": "Products/Services fetched successfully",
            "count": items.count(),
            "items": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
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


# ✅ Delete Product/Service (Tenant-aware)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_service(request, pk):
    try:
        # 1️⃣ Get tenant_id from request data or query params
        tenant_id = request.data.get("tenant") or request.query_params.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 2️⃣ Get tenant object
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # 3️⃣ Get DB alias for this tenant
        db_alias = get_tenant_db(tenant)

        # 4️⃣ Fetch product from tenant DB
        try:
            item = ProductService.objects.using(db_alias).get(id=pk)
        except ProductService.DoesNotExist:
            return Response(
                {"error": "Product/Service not found in tenant DB"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 5️⃣ Delete product in tenant DB
        item.delete(using=db_alias)

        return Response({"success": "Product/Service deleted successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_categories(request):
    try:
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({"success": True, "items": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"success": False, "errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_category(request):
    try:
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response({"success": True, "item": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"success": False, "errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)