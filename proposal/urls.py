from django.urls import path
from . import views

urlpatterns = [
    # Proposals CRUD
    path('create/', views.create_proposal, name='create-proposal'),
    path('list/', views.get_my_proposals, name='list-proposals'),
    path('<uuid:pk>/', views.get_proposal_detail, name='proposal-detail'),
    path('<uuid:pk>/update/', views.update_proposal, name='update-proposal'),
    path('<uuid:pk>/delete/', views.delete_proposal, name='delete-proposal'),
    path('<uuid:pk>/status/', views.update_proposal_status, name='update-proposal-status'),
    path('stats/', views.get_proposal_stats, name='proposal-stats'),
    path('client/<uuid:client_id>/', views.get_proposals_by_client, name='proposal-stats'),
]