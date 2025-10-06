from django.urls import path
from . import views

urlpatterns = [
    path("list/<int:tenant>/", views.list_client_companies, name="list_clients"),
    path("create/", views.create_client_company, name="create_client"),
    path("update/<str:client_id>/", views.update_client_company, name="update_client"),
    path("delete/<str:client_id>/", views.delete_client_company, name="delete_client"),
    path("toggle-status/<str:client_id>/", views.toggle_client_status, name="toggle_client_status"),
]
