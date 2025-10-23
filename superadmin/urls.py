from django.urls import path
from .views import SuperAdminTicketListView,TicketStatusUpdateView

urlpatterns = [
    path('support-reports/', SuperAdminTicketListView.as_view(), name='superadmin-tickets'),
    path("support-reports/<int:pk>/update-status/", TicketStatusUpdateView.as_view(), name="update-ticket-status"),

]
