from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from common.decorators import role_required





# ------------------- INVOICE -------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["admin"])   # only admin can create invoices
def create_invoice(request):
    try:
        data = request.data
        # save invoice in DB (pseudo)
        return Response({"success": "Invoice created", "data": data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])   # both can view
def list_invoices(request):
    try:
        # fetch invoices (pseudo)
        invoices = []
        return Response({"invoices": invoices}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------- PROPOSAL -------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["admin"])  # only admin
def create_proposal(request):
    try:
        data = request.data
        return Response({"success": "Proposal created", "data": data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------- RECEIPT -------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["admin", "staff"])  # both can create receipts
def create_receipt(request):
    try:
        data = request.data
        return Response({"success": "Receipt created", "data": data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
