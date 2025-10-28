from django.urls import path
from . import views

urlpatterns = [
    # Invoice URLs
    path('create/', views.create_invoice, name='create-invoice'),
    path('list/', views.list_invoices, name='list-invoices'),
    path('<uuid:invoice_id>/', views.get_invoice_detail, name='invoice-detail'),
    path('<uuid:invoice_id>/update/', views.update_invoice, name='update-invoice'),
    path('<uuid:invoice_id>/status/', views.update_invoice_status, name='update-invoice-status'),
    path("invoices/send/<int:invoice_id>/", views.send_invoice, name="send_invoice"),

    
    
    # Receipt URLs
    path('receipts/create/', views.create_receipt, name='create-receipt'),
]