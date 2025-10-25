from django.urls import path
from .views import client_admin_analytics,superadmin_analytics

urlpatterns = [
    path('client-admin/analytics/<int:tenant>/', client_admin_analytics, name='client-admin-analytics'),
    path('superadmin/analytics/', superadmin_analytics, name='superadmin-analytics'),
]
