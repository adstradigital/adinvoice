from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from invoices.serializers import InvoiceSerializer
from common.decorators import role_required
from .models import Invoice, InvoiceItem, Receipt, ProposalItem
from proposal.models import Proposal
from tenants.models import Tenant
from tenants.db_utils import get_tenant_db
import traceback
from django.utils import timezone
import random
from django.shortcuts import get_object_or_404

# ------------------- INVOICE -------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])
def create_invoice(request):
    try:
        data = request.data.copy()
        print(data)

        # Generate invoice number if not provided
        if not data.get('invoice_number'):
            timestamp = timezone.now().strftime('%Y%m%d')
            random_num = random.randint(1000, 9999)
            data['invoice_number'] = f"INV-{timestamp}-{random_num}"

        # Get tenant from user if available
        tenant_id = data.get('tenant')
        if tenant_id:
            try:
                tenant = Tenant.objects.get(id=tenant_id)
                db_alias = get_tenant_db(tenant)
            except Tenant.DoesNotExist:
                return Response({"error": "Tenant not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Pass tenant and db_alias in serializer context
        serializer = InvoiceSerializer(data=data, context={"db_alias": db_alias})

        if serializer.is_valid():
            invoice = serializer.save()
            return Response({
                "success": "Invoice created successfully",
                "invoice": InvoiceSerializer(invoice).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("❌ Error in create_invoice:")
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
        
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])   # both can view
def list_invoices(request):
    try:
        tenant_id = request.GET.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        invoices = Invoice.objects.using(db_alias).all().order_by('-created_at')
        
        invoices_data = []
        for invoice in invoices:
            invoices_data.append({
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "client_name": invoice.client_name,
                "issue_date": invoice.issue_date,
                "due_date": invoice.due_date,
                "grand_total": float(invoice.grand_total),
                "amount_paid": float(invoice.amount_paid),
                "balance_due": float(invoice.balance_due),
                "status": invoice.status,
                "template_used": invoice.template_used,
                "created_at": invoice.created_at
            })
        
        return Response({
            "success": "Invoices fetched successfully",
            "count": invoices.count(),
            "invoices": invoices_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])
def get_invoice_detail(request, invoice_id):
    try:
        tenant_id = request.GET.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        invoice = Invoice.objects.using(db_alias).get(id=invoice_id)
        items = InvoiceItem.objects.using(db_alias).filter(invoice=invoice)
        
        items_data = []
        for item in items:
            items_data.append({
                "id": item.id,
                "description": item.description,
                "quantity": float(item.quantity),
                "price": float(item.price),
                "gst_rate": float(item.gst_rate),
                "total": float(item.total),
                "item_type": item.item_type,
                "unit": item.unit
            })
        
        invoice_data = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "proposal_id": invoice.proposal_id,
            "client_name": invoice.client_name,
            "client_email": invoice.client_email,
            "client_phone": invoice.client_phone,
            "client_address": invoice.client_address,
            "client_gstin": invoice.client_gstin,
            "company_name": invoice.company_name,
            "company_email": invoice.company_email,
            "company_phone": invoice.company_phone,
            "company_address": invoice.company_address,
            "company_gstin": invoice.company_gstin,
            "issue_date": invoice.issue_date,
            "due_date": invoice.due_date,
            "subtotal": float(invoice.subtotal),
            "total_gst": float(invoice.total_gst),
            "grand_total": float(invoice.grand_total),
            "notes": invoice.notes,
            "terms": invoice.terms,
            "status": invoice.status,
            "template_used": invoice.template_used,
            "amount_paid": float(invoice.amount_paid),
            "balance_due": float(invoice.balance_due),
            "items": items_data,
            "created_at": invoice.created_at
        }
        
        return Response({
            "success": "Invoice details fetched successfully",
            "invoice": invoice_data
        }, status=status.HTTP_200_OK)

    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])
def update_invoice_status(request, invoice_id):
    try:
        tenant_id = request.data.get("tenant")
        new_status = request.data.get("status")
        
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        invoice = Invoice.objects.using(db_alias).get(id=invoice_id)
        valid_statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid']
        
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice.status = new_status
        invoice.save(using=db_alias)
        
        return Response({
            "success": f"Invoice status updated to {new_status}",
            "invoice": {
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "status": invoice.status
            }
        }, status=status.HTTP_200_OK)

    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------- PROPOSAL -------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])  # both admin and staff can create proposals
def create_proposal(request):
    try:
        data = request.data
        # Your existing proposal creation logic
        return Response({"success": "Proposal created", "data": data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------- RECEIPT -------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])  # both can create receipts
def create_receipt(request):
    try:
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        data = request.data.copy()
        invoice_id = data.get('invoice')
        
        if not invoice_id:
            return Response({"error": "Invoice ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get invoice
        invoice = Invoice.objects.using(db_alias).get(id=invoice_id)
        
        # Create receipt
        receipt = Receipt.objects.using(db_alias).create(
            invoice=invoice,
            payment_date=data.get('payment_date', timezone.now().date()),
            payment_method=data.get('payment_method', 'bank_transfer'),
            amount_paid=data.get('amount_paid', 0),
            reference_number=data.get('reference_number', ''),
            notes=data.get('notes', ''),
            bank_name=data.get('bank_name', ''),
            cheque_number=data.get('cheque_number', ''),
            transaction_id=data.get('transaction_id', '')
        )
        
        return Response({
            "success": "Receipt created successfully",
            "receipt": {
                "id": receipt.id,
                "receipt_number": receipt.receipt_number,
                "invoice_number": invoice.invoice_number,
                "amount_paid": float(receipt.amount_paid),
                "payment_date": receipt.payment_date,
                "payment_method": receipt.payment_method
            }
        }, status=status.HTTP_201_CREATED)

    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Helper function to recalculate invoice totals
def recalculate_invoice_totals(invoice, db_alias):
    items = InvoiceItem.objects.using(db_alias).filter(invoice=invoice)
    
    subtotal = sum(float(item.quantity) * float(item.price) for item in items)
    total_gst = sum(float(item.quantity) * float(item.price) * (float(item.gst_rate) / 100) for item in items)
    grand_total = subtotal + total_gst
    
    invoice.subtotal = subtotal
    invoice.total_gst = total_gst
    invoice.grand_total = grand_total
    invoice.balance_due = grand_total - invoice.amount_paid
    invoice.save(using=db_alias)