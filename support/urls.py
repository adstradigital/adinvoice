from django.urls import path
from .views import create_support_ticket
from .views import list_support_tickets

urlpatterns = [
    path("tickets/", create_support_ticket, name="create-support-ticket"),
    path("tickets/list/", list_support_tickets, name="list-support-tickets"),
]
