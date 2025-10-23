from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes

from support.models import SupportTicket
from .serializers import SupportTicketSerializer


class SuperAdminTicketListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            tickets = SupportTicket.objects.all().order_by('-created_at')
            serializer = SupportTicketSerializer(tickets, many=True)
            return Response({
                "success": True,
                "tickets": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print("❌ Error fetching tickets:", str(e))
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TicketStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk)
            new_status = request.data.get("status")

            if new_status not in ["pending", "resolved"]:
                return Response({
                    "success": False,
                    "error": "Invalid status"
                }, status=status.HTTP_400_BAD_REQUEST)

            ticket.status = new_status
            ticket.save()
            serializer = SupportTicketSerializer(ticket)
            return Response({
                "success": True,
                "ticket": serializer.data
            }, status=status.HTTP_200_OK)

        except SupportTicket.DoesNotExist:
            return Response({
                "success": False,
                "error": "Ticket not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("❌ Error updating ticket status:", str(e))
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_support_ticket(request):
    try:
        data = request.data.copy()
        tenant_user = request.user

        if not tenant_user:
            return Response({
                "success": False,
                "error": "Authenticated user required"
            }, status=status.HTTP_400_BAD_REQUEST)

        data['merchant'] = tenant_user.id
        serializer = SupportTicketSerializer(data=data)

        if serializer.is_valid():
            ticket = serializer.save()
            return Response({
                "success": True,
                "message": "Support ticket submitted successfully!",
                "ticket": SupportTicketSerializer(ticket).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "success": False,
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("❌ Error in create_support_ticket:", str(e))
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
