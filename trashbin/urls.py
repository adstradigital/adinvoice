from django.urls import path
from . import views

urlpatterns = [
    # All deleted items
    path("all/", views.get_all_deleted_items),

    # Restore item
    path("<str:type>/<uuid:id>/restore/", views.restore_item),

    # Permanent delete
    path("<str:type>/<uuid:id>/permanent-delete/", views.permanent_delete_item),
]
