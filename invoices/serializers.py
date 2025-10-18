# invoices/serializers.py
from rest_framework import serializers
from .models import Invoice, InvoiceItem
from proposal.models import Proposal, ProposalItem
import uuid


# ✅ INVOICE SERIALIZERS
class InvoiceItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'description', 'item_type', 'quantity', 'price', 
            'gst_rate', 'total', 'unit'
        ]
        read_only_fields = ['total']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    proposal_title = serializers.CharField(source='proposal.title', read_only=True, allow_null=True)
    proposal_number = serializers.CharField(source='proposal.proposal_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'proposal', 'client_name', 'client_email', 
            'client_phone', 'client_address', 'client_gstin', 'company_name', 
            'company_email', 'company_phone', 'company_address', 'company_gstin',
            'issue_date', 'due_date', 'subtotal', 'total_gst', 'grand_total',
            'notes', 'terms', 'status', 'template_used', 'amount_paid', 'balance_due',
            'created_at', 'updated_at', 'items', 'proposal_title', 'proposal_number'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'balance_due', 'invoice_number']  # Make invoice_number read-only for updates

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        db_alias = self.context.get("db_alias", "default")
        from .models import Proposal
        self.fields["proposal"].queryset = Proposal.objects.using(db_alias).all()

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        db_alias = self.context.get('db_alias', 'default')
        
        invoice = Invoice.objects.using(db_alias).create(**validated_data)
        
        for item_data in items_data:
            InvoiceItem.objects.using(db_alias).create(invoice=invoice, **item_data)
        
        return invoice

    def update(self, instance, validated_data):
        # Don't update items here - handle in view
        items_data = validated_data.pop('items', None)
        
        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save(using=self.context.get('db_alias', 'default'))
        return instance

class InvoiceListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    proposal_title = serializers.CharField(source='proposal.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client_name', 'client_email',
            'issue_date', 'due_date', 'grand_total', 'amount_paid', 'balance_due',
            'status', 'template_used', 'items_count', 'created_at', 'proposal_title'
        ]

