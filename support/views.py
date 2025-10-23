from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import SupportTicket
from .serializers import SupportTicketSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_support_ticket(request):
    try:
        data = request.data.copy()
        
        # Optional: If you want to pass tenant explicitly (not needed if using request.user)
        tenant_user = request.user
        if not tenant_user:
            return Response({"success": False, "error": "Authenticated user required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Attach the merchant (tenant user)
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
