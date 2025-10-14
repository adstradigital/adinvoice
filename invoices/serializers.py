# invoices/serializers.py
from rest_framework import serializers
from .models import Invoice, InvoiceItem, Receipt
from proposal.models import Proposal, ProposalItem
import uuid

class ProposalItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    
    class Meta:
        model = ProposalItem
        fields = [
            'id', 'name', 'description', 'item_type', 
            'quantity', 'price', 'gst_rate', 'total', 'unit', 'order'
        ]
        read_only_fields = ['total']

class ProposalSerializer(serializers.ModelSerializer):
    items = ProposalItemSerializer(many=True, required=False)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'title', 'proposal_number', 'client_name', 'client_email', 
            'client_phone', 'client_address', 'company_name', 'company_email',
            'company_phone', 'company_address', 'company_logo', 'date', 'due_date',
            'subtotal', 'total_gst', 'grand_total', 'notes', 'status', 'template',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        db_alias = self.context.get('db_alias', 'default')
        
        # Save to the correct database
        proposal = Proposal.objects.using(db_alias).create(**validated_data)
        
        # Create proposal items in the same database
        for item_data in items_data:
            ProposalItem.objects.using(db_alias).create(proposal=proposal, **item_data)
        
        return proposal

class ProposalListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_number', 'title', 'client_name', 'client_email',
            'date', 'due_date', 'grand_total', 'status', 'items_count', 'created_at'
        ]

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
        read_only_fields = ['id', 'created_at', 'updated_at', 'balance_due']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        db_alias = self.context.get('db_alias', 'default')
        
        # Create invoice
        invoice = Invoice.objects.using(db_alias).create(**validated_data)
        
        # Create invoice items
        for item_data in items_data:
            InvoiceItem.objects.using(db_alias).create(invoice=invoice, **item_data)
        
        return invoice
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        db_alias = self.context.get('db_alias', 'default')
        
        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save(using=db_alias)
        
        # Update or create items
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                InvoiceItem.objects.using(db_alias).create(invoice=instance, **item_data)
        
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

# ✅ RECEIPT SERIALIZERS
class ReceiptSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    client_name = serializers.CharField(source='invoice.client_name', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'invoice', 'invoice_number', 'client_name',
            'payment_date', 'payment_method', 'amount_paid', 'reference_number',
            'notes', 'bank_name', 'cheque_number', 'transaction_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        db_alias = self.context.get('db_alias', 'default')
        return Receipt.objects.using(db_alias).create(**validated_data)

class ReceiptListSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    client_name = serializers.CharField(source='invoice.client_name', read_only=True)
    grand_total = serializers.DecimalField(source='invoice.grand_total', read_only=True, max_digits=12, decimal_places=2)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'invoice_number', 'client_name',
            'payment_date', 'payment_method', 'amount_paid', 'grand_total',
            'reference_number', 'created_at'
        ]