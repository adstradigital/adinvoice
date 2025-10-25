import traceback
from django.db.models import Count, Sum
from django.utils.timezone import now, timedelta
from django.db.models.functions import TruncDate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from common_enquiries.models import CommonEnquiry
from support.models import User
from notifications.serializers import NotiNotificationSerializer, NotificationSerializer
from notifications.models import Notification
from productservices.models import ProductService
from clients.models import ClientCompany
from invoices.models import Invoice
from proposal.models import Proposal
from receipts.models import Receipt
from tenants.models import Tenant
from tenants.db_utils import get_tenant_db


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_admin_analytics(request, tenant):
    try:
        tenant_id = tenant # ✅ Correct way for GET header
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔹 Get tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # 🔹 Get tenant DB alias
        db_alias = get_tenant_db(tenant)

        # 🔹 Count proposals, invoices, receipts filtered by client admin
        proposal_count = Proposal.objects.using(db_alias).count()
        invoice_count = Invoice.objects.using(db_alias).count()
        receipt_count = Receipt.objects.using(db_alias).count()
        clients_count = ClientCompany.objects.using(db_alias).count()
        products_and_service = ProductService.objects.using(db_alias).count()
        
        # notifications = Notification.objects.all()
        notifications = Notification.objects.order_by('-created_at')[:3]

        data = NotiNotificationSerializer(notifications, many=True)


        return Response({
            "success": True,
            "proposal_count": proposal_count,
            "invoice_count": invoice_count,
            "receipt_count": receipt_count,
            "client_count": clients_count,
            "product_and_service": products_and_service,
            "notification": data.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("❌ Error in client_admin_analytics:")
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def superadmin_analytics(request):
    try:
        # Main DB counts
        proposal_count = Proposal.objects.count()
        invoice_count = Invoice.objects.count()
        receipt_count = Receipt.objects.count()
        clients_count = ClientCompany.objects.count()
        products_and_service = ProductService.objects.count()
        notifications = Notification.objects.all()
        notifications_data = NotiNotificationSerializer(notifications, many=True).data

        # New metrics for dashboard
        merchant_count = User.objects.filter(role="admin").count()
        merchant_approval_count = User.objects.filter(role="admin", application_status="approved").count()
        common_enquiry_count = CommonEnquiry.objects.count()

        # TODO: Replace with your MerchantIssue model if exists
        merchant_issue_report_count = 0

        return Response({
            "success": True,
            "proposal_count": proposal_count,
            "invoice_count": invoice_count,
            "receipt_count": receipt_count,
            "client_count": clients_count,
            "product_and_service": products_and_service,
            "merchant_count": merchant_count,
            "merchant_approval_count": merchant_approval_count,
            "common_enquiry_count": common_enquiry_count,
            "merchant_issue_report_count": merchant_issue_report_count,
            "notification": notifications_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("❌ Error in superadmin_analytics:")
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
