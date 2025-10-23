from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import CommonEnquiry
from .serializers import CommonEnquirySerializer

# List all enquiries (super admin)
class EnquiryListView(generics.ListAPIView):
    queryset = CommonEnquiry.objects.all().order_by('-created_at')
    serializer_class = CommonEnquirySerializer
    permission_classes = [IsAuthenticated]

# Create new enquiry (public)
class EnquiryCreateView(generics.CreateAPIView):
    queryset = CommonEnquiry.objects.all()
    serializer_class = CommonEnquirySerializer

# Update enquiry status (super admin)
class EnquiryUpdateStatusView(generics.UpdateAPIView):
    queryset = CommonEnquiry.objects.all()
    serializer_class = CommonEnquirySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
