# receipts/views.py - SIMPLIFIED NO TENANT
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from invoices.models import Invoice
from tenants.db_utils import get_tenant_db
from tenants.models import Tenant
from .models import Receipt
from .serializers import ReceiptSerializer, ReceiptCreateSerializer, ReceiptListSerializer

# ✅ Create Receipt - NO TENANT
@api_view(['POST'])
def create_receipt(request):
    try:
        data = request.data.copy()
        print(data)


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

        invoice_id = request.data.get("invoice")
        invoice_instance = None
        if invoice_id:
            try:
                from invoices.models import Invoice
                invoice_instance = Invoice.objects.using(db_alias).get(id=invoice_id)
            except Invoice.DoesNotExist:
                return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

        data['invoice'] = invoice_instance  # pass the **instance**, not UUID

        
        # Remove tenant from data if present
        if 'tenant' in data:
            data.pop('tenant')
        
        # Generate receipt number if not provided
        if not data.get('receipt_number'):
            from django.utils import timezone
            import random
            timestamp = timezone.now().strftime('%Y%m%d')
            random_num = random.randint(1000, 9999)
            data['receipt_number'] = f"R-{timestamp}-{random_num}"
            

        serializer = ReceiptCreateSerializer(data=data, context={"db_alias": db_alias})

        if serializer.is_valid():
            receipt = serializer.save()
            return Response({
                "success": True,
                "message": "Receipt created successfully",
                "receipt": ReceiptSerializer(receipt).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "success": False,
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("❌ Error in create_receipt:", str(e))
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Get All Receipts - NO TENANT
@api_view(['GET'])
def list_receipts(request):
    try:
        receipts = Receipt.objects.all().order_by('-created_at')
        serializer = ReceiptListSerializer(receipts, many=True)
        
        return Response({
            "success": True,
            "count": receipts.count(),
            "receipts": serializer.data
        })

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Get Single Receipt - NO TENANT
@api_view(['GET'])
def get_receipt_detail(request, receipt_id):
    try:
        receipt = get_object_or_404(Receipt, id=receipt_id)
        serializer = ReceiptSerializer(receipt)
        
        return Response({
            "success": True,
            "receipt": serializer.data
        })

    except Receipt.DoesNotExist:
        return Response({
            "success": False,
            "error": "Receipt not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Update Receipt - NO TENANT
@api_view(['PUT', 'PATCH'])
def update_receipt(request, receipt_id):
    try:
        receipt = get_object_or_404(Receipt, id=receipt_id)
        
        serializer = ReceiptCreateSerializer(receipt, data=request.data, partial=True)
        if serializer.is_valid():
            updated_receipt = serializer.save()
            return Response({
                "success": True,
                "message": "Receipt updated successfully",
                "receipt": ReceiptSerializer(updated_receipt).data
            })
        else:
            return Response({
                "success": False,
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Receipt.DoesNotExist:
        return Response({
            "success": False,
            "error": "Receipt not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Delete Receipt - NO TENANT
@api_view(['DELETE'])
def delete_receipt(request, receipt_id):
    try:
        receipt = get_object_or_404(Receipt, id=receipt_id)
        receipt.delete()
        
        return Response({
            "success": True,
            "message": "Receipt deleted successfully"
        })

    except Receipt.DoesNotExist:
        return Response({
            "success": False,
            "error": "Receipt not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Get Receipt Statistics - NO TENANT
@api_view(['GET'])
def get_receipt_stats(request):
    try:
        receipts = Receipt.objects.all()
        
        stats = {
            'total_receipts': receipts.count(),
            'total_amount': float(receipts.aggregate(models.Sum('total_amount'))['total_amount__sum'] or 0),
            'total_paid': float(receipts.aggregate(models.Sum('paid_amount'))['paid_amount__sum'] or 0),
            'total_balance': float(receipts.aggregate(models.Sum('balance_amount'))['balance_amount__sum'] or 0),
            'status_counts': {
                'pending': receipts.filter(status='Pending').count(),
                'partially_paid': receipts.filter(status='Partially Paid').count(),
                'paid': receipts.filter(status='Paid').count(),
                'closed': receipts.filter(status='Closed').count(),
            }
        }

        return Response({
            "success": True,
            "stats": stats
        })

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)