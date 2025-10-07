from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_entrepreneur, name="register"),
    path("signin/", views.signin, name="signin"),
    path("verify-email-otp/", views.verify_email_otp, name="verify_email_otp"),
    path("verify-sms-otp/", views.verify_sms_otp, name="verify_sms_otp"),
    path("approve-entrepreneur/<int:user_id>/", views.approve_entrepreneur, name="approve_entrepreneur"),
    path("own-company/", views.get_company_details, name="my_company_details"),        
    path("own-company/<int:user_id>/", views.get_company_details, name="company_details"),
    path("own-company/update/", views.update_company_details, name="update_company_details"),
    path("own-company/documents/", views.list_documents, name="list_documents"),
    path("own-company/upload-document/", views.upload_document, name="upload_document"),
    path("own-company/delete-document/<int:doc_id>/", views.delete_document, name="delete_document"),
    path('pending-users/', views.pending_users, name='pending-users'),
    
]
    