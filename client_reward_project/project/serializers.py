from rest_framework import serializers
from onboarding.models import KAH, Manager
from onboarding.serializers import ClientSerializer
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only = True)
    class Meta:
        model = Project
        fields = '__all__'
        depth = 1

class ProjectCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields =  ['project_name', 'project_description', 'project_cost', 'type_of_service', 'status']
    
    def create(self, validated_data):
        return Project.objects.create(**validated_data)
    
class ProjectFileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    class Meta:
        model = Project
