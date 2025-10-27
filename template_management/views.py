from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import InvoiceTemplate
from django.core.files.storage import default_storage
import json

# List all templates
def list_templates(request):
    if request.method == "GET":
        templates = InvoiceTemplate.objects.all().values("id", "title", "file")
        return JsonResponse(list(templates), safe=False)

# Upload / create a template
@csrf_exempt
def create_template(request):
    if request.method == "POST":
        title = request.POST.get("title")
        file = request.FILES.get("file")

        if not title or not file:
            return JsonResponse({"error": "Title and file are required"}, status=400)

        template = InvoiceTemplate(title=title, file=file)
        template.save()
        return JsonResponse({"id": template.id, "title": template.title, "file": template.file.url})

# Delete a template
@csrf_exempt
def delete_template(request, id):
    if request.method == "DELETE":
        try:
            template = InvoiceTemplate.objects.get(id=id)
            template.delete()
            return JsonResponse({"success": True})
        except InvoiceTemplate.DoesNotExist:
            return JsonResponse({"error": "Template not found"}, status=404)
