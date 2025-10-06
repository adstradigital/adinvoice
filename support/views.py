from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from tenants.models import Tenant
from .models import SupportTicket
from .serializers import SupportTicketSerializer
from users.models import User  # Adjust import if your apps differ


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_support_ticket(request):
    try:
        # ✅ Get tenant from request data
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)

        # ✅ Use current logged-in user if needed
        user = request.user

        # ✅ Initialize serializer
        serializer = SupportTicketSerializer(data=request.data)

        # ✅ Validate and save (default DB is used automatically)
        if serializer.is_valid():
            ticket = serializer.save(user=user, tenant=tenant)

            return Response({
                "success": "Support ticket submitted successfully",
                "ticket": SupportTicketSerializer(ticket).data
            }, status=status.HTTP_201_CREATED)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_support_tickets(request):
    try:
        # ✅ Get tenant from query params
        tenant_id = request.query_params.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Filter tickets by tenant (and optionally by logged-in user)
        tickets = SupportTicket.objects.filter(tenant=tenant, user=request.user).order_by("-created_at")

        serializer = SupportTicketSerializer(tickets, many=True)
        return Response({"tickets": serializer.data}, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
