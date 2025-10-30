from rest_framework import serializers
from tenants.models import Tenant
from .models import Proposal, ProposalItem
import uuid

class ProposalItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    
    class Meta:
        model = ProposalItem
        fields = [
            'id', 'name', 'description', 'item_type', 
            'quantity', 'price', 'gst_rate', 'total', 'order',
            'hsn_sac_code', 'part_service_code'  
        ]
        read_only_fields = ['total']

# In proposal/serializers.py
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
        
        # ✅ USE THE DYNAMIC DB ALIAS FROM CONTEXT
        db_alias = self.context.get('db_alias', 'default')
        print(f"🔧 Using database alias: {db_alias}")
        
        # Get tenant from validated_data (it's a Tenant instance due to PrimaryKeyRelatedField)
        
        # Save to the correct database
        proposal = Proposal.objects.using(db_alias).create(**validated_data)
        
        # Create proposal items in the same database
        for item_data in items_data:
            # Ensure new fields are included with default values if not provided
            item_data.setdefault('hsn_sac_code', '')
            item_data.setdefault('part_service_code', '')
            ProposalItem.objects.using(db_alias).create(proposal=proposal, **item_data)
        
        print(f"✅ Proposal saved to {db_alias}: {proposal.proposal_number}")
        return proposal
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update proposal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle items update
        if items_data:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items with new fields
            for item_data in items_data:
                item_data.setdefault('hsn_sac_code', '')
                item_data.setdefault('part_service_code', '')
                ProposalItem.objects.create(proposal=instance, **item_data)
        
        return instance

# Add this to your serializers.py
class ProposalListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_number', 'title', 'client_name', 'client_email',
            'date', 'due_date', 'grand_total', 'status', 'items_count', 'created_at', 'is_deleted'
        ]