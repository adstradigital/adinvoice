from django.urls import path
from . import views 

urlpatterns = [
    path("create/", views.create_tenant, name="create-tenant"),
    path("list/", views.list_tenants, name="list-tenants"),
    path("<int:tenant_id>/", views.get_tenant, name="get-tenant"),
    path("update/<int:tenant_id>/", views.update_tenant, name="update-tenant"),
    path("delete/<int:tenant_id>/", views.delete_tenant, name="delete-tenant"),
]
