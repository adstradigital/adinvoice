from django.urls import path
from .views import (
    create_product_service,
    get_my_products_services,
    update_product_service,
    delete_product_service,
)

urlpatterns = [
    path("create/", create_product_service, name="create_product_service"),
    path("my/", get_my_products_services, name="get_my_products_services"),
    path("<int:pk>/update/", update_product_service, name="update_product_service"),
    path("<int:pk>/delete/", delete_product_service, name="delete_product_service"),
]
