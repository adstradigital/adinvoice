from django.urls import path
from .views import EnquiryListView, EnquiryCreateView, EnquiryUpdateStatusView

urlpatterns = [
    path("enquiries/", EnquiryListView.as_view(), name="enquiry-list"),
    path("enquiries/create/", EnquiryCreateView.as_view(), name="enquiry-create"),
    path("enquiries/<int:id>/", EnquiryUpdateStatusView.as_view(), name="enquiry-update"),
    
]
