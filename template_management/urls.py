from django.urls import path
from . import views

urlpatterns = [
    path("templates/", views.list_templates, name="list_templates"),       # GET
    path("templates/create/", views.create_template, name="create_template"),  # POST
    path("templates/<int:id>/delete/", views.delete_template, name="delete_template"),  # DELETE
]
