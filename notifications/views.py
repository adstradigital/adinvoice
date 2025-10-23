from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from tenants.db_utils import get_tenant_db
from tenants.models import Tenant
from .models import Notification, NotificationRead
from .serializers import NotificationSerializer
from django.db.models import Q
import traceback

# ✅ Create Super Admin Notification
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification_super_admin(request):
    try:
        message = request.data.get("message")
        notification_type = request.data.get("notification_type", "ANNOUNCEMENT")

        if not message:
            return Response({"success": False, "errors": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Super admin notification is global, no tenant
        notification = Notification.objects.create(
            sender_type='SUPER_ADMIN',
            notification_type=notification_type,
            message=message,
            tenant=None
        )

        serializer = NotificationSerializer(notification)
        return Response({"success": True, "item": serializer.data}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"success": False, "errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Create Client Admin Notification
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification_client_admin(request):
    try:
        message = request.data.get("message")
        notification_type = request.data.get("notification_type", "UPDATE")

        if not message:
            return Response({"success": False, "errors": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = getattr(request.user, 'tenant', None)

        notification = Notification.objects.create(
            sender_type='CLIENT_ADMIN',
            notification_type=notification_type,
            message=message,
            tenant=tenant
        )

        serializer = NotificationSerializer(notification)
        return Response({"success": True, "item": serializer.data}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"success": False, "errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ List Notifications
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    try:
        tenant = getattr(request.user, 'tenant', None)

        notifications = Notification.objects.filter(
            Q(tenant=tenant) | Q(tenant__isnull=True)
        ).order_by('-created_at')

        read_ids = NotificationRead.objects.filter(user=request.user).values_list('notification_id', flat=True)

        serializer = NotificationSerializer(notifications, many=True)
        data = serializer.data
        # Add read status
        for item in data:
            item['read'] = item['id'] in read_ids

        return Response({"success": True, "count": len(data), "items": data}, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"success": False, "errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Mark Notification as Read
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request):
    try:
        notification_id = request.data.get("notification_id")
        if not notification_id:
            return Response({"success": False, "errors": "notification_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        notification = Notification.objects.filter(id=notification_id).first()
        if not notification:
            return Response({"success": False, "errors": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

        NotificationRead.objects.get_or_create(notification=notification, user=request.user)

        return Response({"success": True}, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"success": False, "errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
