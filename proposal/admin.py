from django.contrib import admin
from .models import Proposal, ProposalItem

class ProposalItemInline(admin.TabularInline):
    model = ProposalItem
    extra = 1

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = [
        'proposal_number', 
        'client_name', 
        'date', 
        'due_date', 
        'grand_total', 
        'status'
    ]
    list_filter = [
        'status', 
        'date',
        'created_at',  
        'template'
    ]
    search_fields = [
        'proposal_number', 
        'client_name', 
        'client_email'
    ]
    inlines = [ProposalItemInline]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'  # ✅ Nice addition for date filtering

@admin.register(ProposalItem)
class ProposalItemAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'proposal', 
        'quantity', 
        'price', 
        'gst_rate', 
        'total'
    ]
    list_filter = ['item_type']
    search_fields = ['name', 'proposal__proposal_number']