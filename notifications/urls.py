from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_notification_super_admin, name='create_super_admin'),
    path('create/client-admin/', views.create_notification_client_admin, name='create_client_admin'),
    path('list/', views.list_notifications, name='list_notifications'),
    path('read/', views.mark_as_read, name='mark_as_read'),
]
