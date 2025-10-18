# receipts/serializers.py
from rest_framework import serializers

from invoices.serializers import InvoiceSerializer
from .models import Receipt

class ReceiptSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    client_company = serializers.CharField(source='invoice.client.company_name', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number','invoice', 'invoice_number', 'date',
            'client_name', 'client_email', 'description', 'total_amount',
            'paid_amount', 'balance_amount', 'due_date', 'next_payment',
            'status', 'created_at', 'updated_at', 'client_company'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'balance_amount']

class ReceiptCreateSerializer(serializers.ModelSerializer):
    invoice = InvoiceSerializer(read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'invoice','receipt_number', 'date', 'client_name', 'client_email',
            'description', 'total_amount', 'paid_amount', 'due_date',
            'next_payment', 'status'
        ]
    
    def create(self, validated_data):
        db_alias = self.context.get('db_alias', 'default')
        print(f"🔧 Using database alias for receipt: {db_alias}")
        
        # If invoice doesn't exist in this database, set to None
        invoice_id = validated_data.get('invoice')
        if invoice_id:
            try:
                from invoices.models import Invoice
                Invoice.objects.using(db_alias).get(id=invoice_id)
            except Invoice.DoesNotExist:
                print(f"⚠️ Invoice {invoice_id} not found, setting to None")
                validated_data['invoice'] = None
        
        receipt = Receipt.objects.using(db_alias).create(**validated_data)
        
        print(f"✅ Receipt saved to {db_alias}: {receipt}")
        return receipt

class ReceiptListSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'invoice_number', 'date', 'client_name',
            'total_amount', 'paid_amount', 'balance_amount', 'status', 'created_at'
        ]