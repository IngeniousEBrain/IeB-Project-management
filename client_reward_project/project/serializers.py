from os import read
from rest_framework import serializers
from onboarding.models import KAH, Client, Manager
from onboarding.serializers import ClientSerializer
from .models import ClientProjectAssociation, Comment, Document, Invoice, Project

class ClientProjectAssociationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProjectAssociation
        fields = "__all__"
        depth=1

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"

class CommentSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M UTC')
    
    class Meta:
        model = Comment
        fields = "__all__"
        depth = 1

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        depth = 1

class ProjectCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields =  ['project_code', 'project_name', 'project_description', 'proposal_upload_file', 'project_cost', 'currency', 'type_of_service', 'status', 'business_unit']
        extra_kwargs= {
            'proposal_upload_file':{'required':False}
        }

    def create(self, validated_data):
        project = Project.objects.create(**validated_data)
        return project
    
class ProjectFileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    class Meta:
        model = Project


class CommentCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields =  ['comment', 'document']
        extra_kwargs= {
            'document':{'required':False}
        }

    def create(self, validated_data):
        new_comment = Comment.objects.create(**validated_data)
        return new_comment
    
class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields =  ['invoice_number', 'amount', 'currency', 'invoice_file']

    def create(self, validated_data):
        invoice = Invoice.objects.create(**validated_data)
        return invoice