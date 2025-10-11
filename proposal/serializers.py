from rest_framework import serializers
from .models import Proposal, ProposalItem
import uuid

class ProposalItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    
    class Meta:
        model = ProposalItem
        fields = [
            'id', 'name', 'description', 'item_type', 
            'quantity', 'price', 'gst_rate', 'total', 'order'
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
            'tenant', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        proposal = Proposal.objects.create(**validated_data)
        
        # Create proposal items
        for item_data in items_data:
            ProposalItem.objects.create(proposal=proposal, **item_data)
        
        return proposal
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update proposal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create items
        if items_data:
            # Get existing item IDs
            existing_item_ids = set(instance.items.values_list('id', flat=True))
            updated_item_ids = set()
            
            for item_data in items_data:
                item_id = item_data.get('id')
                if item_id and instance.items.filter(id=item_id).exists():
                    # Update existing item
                    item = instance.items.get(id=item_id)
                    for attr, value in item_data.items():
                        setattr(item, attr, value)
                    item.save()
                    updated_item_ids.add(item_id)
                else:
                    # Create new item
                    ProposalItem.objects.create(proposal=instance, **item_data)
            
            # Delete items not in the update
            items_to_delete = existing_item_ids - updated_item_ids
            if items_to_delete:
                instance.items.filter(id__in=items_to_delete).delete()
        
        return instance

class ProposalListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_number', 'title', 'client_name', 'client_email',
            'date', 'due_date', 'grand_total', 'status', 'items_count', 'created_at'
        ]