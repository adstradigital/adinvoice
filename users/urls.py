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
    path('login/', views.superadmin_login, name='superadmin-login'),
    path("merchants/", views.merchant_list, name="merchant-list"),
    
    path("user/<int:tenant_id>/", views.user_list, name="user-list"),
    path("user/create/<int:tenant_id>/", views.user_create, name="user-create"),
    path("user/<int:user_id>/", views.user_update, name="user-update"),
    path("user/<int:user_id>/delete/", views.user_delete, name="user-delete"),
    path("roles/<int:tenant_id>/", views.role_list_create, name="role-list-create"),
    path("roles/<int:role_id>/update/", views.role_update, name="role-update"),
    path("roles/<int:role_id>/delete/", views.role_delete, name="role-delete"),
    path("permissions/", views.permission_list_create, name="permission-list-create"),
    path("permissions/<int:perm_id>/", views.permission_update_delete, name="permission-update-delete"),
    path("assign-role/", views.assign_role_to_user, name="assign-role"),
    path("assign-permission/", views.assign_permission_to_role, name="assign-permission"),
    path("user/<int:user_id>/roles-permissions/", views.user_roles_permissions, name="user-roles-permissions"),
]