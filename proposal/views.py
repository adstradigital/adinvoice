import traceback

from django.db import connections
from tenants.db_utils import get_tenant_db
from tenants.models import Tenant
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Proposal, ProposalItem
from clients.models import ClientCompany
from .serializers import ProposalItemSerializer, ProposalSerializer, ProposalListSerializer
import uuid

# ✅ Create Proposal
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_proposal(request):
    try:
        tenant_id = request.data.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        db_alias = get_tenant_db(tenant)
        print(f"🔍 Tenant DB alias: {db_alias}")
        
        data = request.data.copy()
        
        # Remove tenant from data since we'll pass it separately
        if 'tenant' in data:
            data.pop('tenant')
        
        # Generate proposal number if not provided
        if not data.get('proposal_number'):
            from django.utils import timezone
            import random
            timestamp = timezone.now().strftime('%Y%m%d')
            random_num = random.randint(1000, 9999)
            data['proposal_number'] = f"PROP-{timestamp}-{random_num}"

        serializer = ProposalSerializer(
            data=data,
            context={
                "db_alias": db_alias,
                "request": request
            }
        )

        if serializer.is_valid():
            # ✅ Save with tenant passed separately
            proposal = serializer.save()
            return Response({
                "success": "Proposal created successfully",
                "proposal": ProposalSerializer(proposal, context={"db_alias": db_alias}).data
            }, status=status.HTTP_201_CREATED)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("❌ Error in create_proposal:")
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    

# ✅ Get All Proposals for Tenant
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_my_proposals(request):
    try:
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
        print(db_alias)

        # 🔹 Fetch proposals from tenant DB
        proposals = Proposal.objects.using(db_alias).all().order_by('-created_at')

        print(proposals)

        serializer = ProposalListSerializer(
            proposals,
            many=True,
            context={"db_alias": db_alias, "tenant": tenant}
        )

        return Response({
            "success": "Proposals fetched successfully",
            "count": proposals.count(),
            "proposals": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# Add this view to your Django backend for direct client filtering
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_proposals_by_client(request, client_id):
    try:
        tenant_id = request.GET.get("tenant")
        if not tenant_id:
            return Response(
                {"error": "Tenant ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Fetch tenant and determine DB alias
        tenant = Tenant.objects.get(id=tenant_id)
        db_alias = get_tenant_db(tenant)

        # ✅ Get the client
        client = ClientCompany.objects.using(db_alias).get(id=client_id)

        # ✅ Fix: Use company_name instead of name
        proposals = Proposal.objects.using(db_alias).filter(
            client_name=client.name  # Changed from client.name to client.company_name
        ).order_by('-created_at')

        serializer = ProposalSerializer(
            proposals,
            many=True,
            context={"db_alias": db_alias, "tenant": tenant}
        )

        return Response({
            "success": True,
            "count": proposals.count(),
            "proposals": serializer.data
        }, status=status.HTTP_200_OK)

    except ClientCompany.DoesNotExist:
        return Response(
            {"error": "Client not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Tenant.DoesNotExist:
        return Response(
            {"error": "Invalid tenant ID"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(traceback.format_exc())
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



# ✅ Get Single Proposal
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_proposal_detail(request, pk):
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

        # 🔹 Fetch proposal from tenant DB
        try:
            proposal = Proposal.objects.using(db_alias).get(id=pk)
        except Proposal.DoesNotExist:
            return Response(
                {"error": "Proposal not found in tenant DB"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProposalSerializer(
            proposal,
            context={"db_alias": db_alias, "tenant": tenant}
        )

        return Response({
            "success": "Proposal fetched successfully",
            "proposal": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_proposal_items(request, pk):
    try:
        tenant_id = request.GET.get("tenant")
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get tenant and database alias
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        db_alias = get_tenant_db(tenant)

        # Get items from the correct tenant database
        items = ProposalItem.objects.using(db_alias).filter(proposal_id=pk)
        serializer = ProposalItemSerializer(items, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Update Proposal
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_proposal(request, pk):
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

        # 🔹 Fetch proposal from tenant DB
        try:
            proposal = Proposal.objects.using(db_alias).get(id=pk)
        except Proposal.DoesNotExist:
            return Response(
                {"error": "Proposal not found in tenant DB"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔹 Update with serializer
        serializer = ProposalSerializer(
            proposal, 
            data=request.data, 
            partial=True,
            context={"db_alias": db_alias, "tenant": tenant}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": "Proposal updated successfully",
                "proposal": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ✅ Delete Proposal (Tenant-aware)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_proposal(request, pk):
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

        # 4️⃣ Fetch proposal from tenant DB
        try:
            proposal = Proposal.objects.using(db_alias).get(id=pk)
        except Proposal.DoesNotExist:
            return Response(
                {"error": "Proposal not found in tenant DB"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 5️⃣ Delete proposal in tenant DB
        proposal.delete(using=db_alias)

        return Response({"success": "Proposal deleted successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ✅ Update Proposal Status
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_proposal_status(request, pk):
    try:
        tenant_id = request.data.get("tenant")
        new_status = request.data.get("status")
        
        if not tenant_id:
            return Response({"error": "Tenant ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Valid statuses
        valid_statuses = ['draft', 'sent', 'accepted', 'rejected', 'expired']
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔹 Get tenant and db alias
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        db_alias = get_tenant_db(tenant)

        # 🔹 Fetch proposal from tenant DB
        try:
            proposal = Proposal.objects.using(db_alias).get(id=pk)
        except Proposal.DoesNotExist:
            return Response(
                {"error": "Proposal not found in tenant DB"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update status
        proposal.status = new_status
        proposal.save(using=db_alias)

        return Response({
            "success": f"Proposal status updated to {new_status}",
            "proposal": ProposalSerializer(proposal, context={"db_alias": db_alias}).data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    



# ✅ Get Proposal Statistics
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_proposal_stats(request):
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

        # 🔹 Fetch proposals from tenant DB
        proposals = Proposal.objects.using(db_alias).all()

        stats = {
            'total': proposals.count(),
            'draft': proposals.filter(status='draft').count(),
            'sent': proposals.filter(status='sent').count(),
            'accepted': proposals.filter(status='accepted').count(),
            'rejected': proposals.filter(status='rejected').count(),
            'expired': proposals.filter(status='expired').count(),
            'total_value': float(proposals.aggregate(models.Sum('grand_total'))['grand_total__sum'] or 0),
        }

        return Response({
            "success": "Proposal statistics fetched successfully",
            "stats": stats
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)