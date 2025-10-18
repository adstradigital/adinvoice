# receipts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Receipts CRUD (EXACTLY LIKE PROPOSAL URLS)
    path('create/', views.create_receipt, name='create-receipt'),
    path('list/', views.list_receipts, name='list-receipts'),
    path('<uuid:receipt_id>/', views.get_receipt_detail, name='receipt-detail'),
    path('<uuid:receipt_id>/update/', views.update_receipt, name='update-receipt'),
    path('<uuid:receipt_id>/delete/', views.delete_receipt, name='delete-receipt'),
    path('stats/', views.get_receipt_stats, name='receipt-stats'),
]