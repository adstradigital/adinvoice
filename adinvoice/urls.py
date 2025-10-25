from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tenants/', include('tenants.urls')),
    path('api/users/', include('users.urls')),
    path('api/clients/', include('clients.urls')),
    path('api/products/', include('productservices.urls')),
    path('api/support/', include('support.urls')),
    path('api/proposal/', include('proposal.urls')),

    path('api/invoices/', include('invoices.urls')),
    path('api/receipts/', include('receipts.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/superadmin/', include('superadmin.urls')),
    path('api/',include('common_enquiries.urls')),
    path('api/analytic/',include('report_and_analytics.urls')),
    path('api/template-management/', include('template_management.urls')),
    path('api/trashbin/', include('trashbin.urls'))


]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
