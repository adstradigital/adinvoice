from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from proposal.models import Proposal
from invoices.models import Invoice
from receipts.models import Receipt
from tenants.models import Tenant
from tenants.db_utils import get_tenant_db  # your function to get DB alias

# ✅ Common functions
def move_to_trash(instance):
    instance.is_deleted = True
    instance.deleted_at = timezone.now()
    instance.save(using=instance._state.db)  # ensure correct DB

def restore_from_trash(instance):
    instance.is_deleted = False
    instance.deleted_at = None
    instance.save(using=instance._state.db)

# ✅ Helper to get DB alias (you can adjust tenant selection)

# ✅ Fetch all deleted items
def get_all_deleted_items(request):
    tenant_id = request.GET.get("tenant_id")

    if not tenant_id:
        return JsonResponse({"error": "tenant_id required"}, status=400)

    try:
        tenant = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        return JsonResponse({"error": "Tenant not found"}, status=404)

    db_alias = get_tenant_db(tenant)

    proposals = Proposal.objects.using(db_alias).filter(is_deleted=True)
    invoices = Invoice.objects.using(db_alias).filter(is_deleted=True)
    receipts = Receipt.objects.using(db_alias).filter(is_deleted=True)

    print("✅ Using DB:", db_alias)
    print("✅ Found:", proposals, invoices, receipts)

    all_items = [
        {
            "id": str(p.id),
            "type": "proposal",
            "title": p.title,
            "deleted_at": p.deleted_at,
        } for p in proposals
    ] + [
        {
            "id": str(i.id),
            "type": "invoice",
            "invoice_number": i.invoice_number,
            "deleted_at": i.deleted_at,
        } for i in invoices
    ] + [
        {
            "id": str(r.id),
            "type": "receipt",
            "receipt_number": r.receipt_number,
            "deleted_at": r.deleted_at,
        } for r in receipts
    ]

    return JsonResponse(all_items, safe=False)

# ✅ Restore item
@csrf_exempt
@require_http_methods(["PUT"])
def restore_item(request, type, id):
    db_alias = get_db_alias(request)
    try:
        if type == "proposal":
            obj = Proposal.objects.using(db_alias).get(id=id)
        elif type == "invoice":
            obj = Invoice.objects.using(db_alias).get(id=id)
        elif type == "receipt":
            obj = Receipt.objects.using(db_alias).get(id=id)
        else:
            return JsonResponse({"error": "Invalid type"}, status=400)

        restore_from_trash(obj)
        return JsonResponse({"message": f"{type.capitalize()} restored ✅"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=404)

# ✅ Permanent delete item
@csrf_exempt
@require_http_methods(["DELETE"])
def permanent_delete_item(request, type, id):
    db_alias = get_db_alias(request)
    try:
        if type == "proposal":
            Proposal.objects.using(db_alias).filter(id=id).delete()
        elif type == "invoice":
            Invoice.objects.using(db_alias).filter(id=id).delete()
        elif type == "receipt":
            Receipt.objects.using(db_alias).filter(id=id).delete()
        else:
            return JsonResponse({"error": "Invalid type"}, status=400)

        return JsonResponse({"message": f"{type.capitalize()} permanently deleted 🗑"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=404)
