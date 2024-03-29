from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser

from onboarding.models import KAH, Manager, User
from onboarding.serializers import KAHSerializer, ManagerSerializer

from .models import Project
from .serializers import ProjectCreationSerializer, ProjectFileUploadSerializer, ProjectSerializer

# Create your views here.
class ProjectCreationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        serializer = ProjectCreationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            project = serializer.save(client=self.request.user.client)
            return Response({'msg':'Project created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UnassignedProjectsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            unassigned_projects = Project.objects.filter(project_manager=None, account_manager=None)
            projects = ProjectSerializer(unassigned_projects, many=True)
            return Response({'projects': projects.data, 'msg':'Project created successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class ManagersListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            managers = Manager.objects.all()
            list = ManagerSerializer(managers, many=True)
            return Response({'managers': list.data, 'msg':'List of managers populated successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class KAHListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            account_holders = KAH.objects.all()
            list = KAHSerializer(account_holders, many=True)
            return Response({'kahs': list.data, 'msg':'List of key account holders populated successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class ProjectDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id, format=None):
        if request.user.is_superuser:
            project = Project.objects.get(project_id=id)
            projectDetails = ProjectSerializer(project)
            return Response({'project': projectDetails.data, 'msg':'Project accessed successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)

class AssignView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id, format=None):
        if request.user.is_superuser:
            project = Project.objects.get(project_id=id)
            manager = Manager.objects.get(email = request.data['project_manager'])
            kah = KAH.objects.get(email = request.data['account_manager'])
            project.project_manager = manager
            project.account_manager = kah
            project.save()
            return Response({'msg':'Project assigned successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class DisplayAssignedProjects(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        user = User.objects.get(email=request.user)
        if user is not None:
            try:
                manager = user.manager
                print("Manager")
                projects = Project.objects.filter(project_manager=manager)
            except:
                try:
                    kah = user.kah
                    print("Key Account Holder")
                    projects = Project.objects.filter(account_manager=kah)
                except:
                    return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
            result = ProjectSerializer(projects, many=True)
            return Response({'projects': result.data, 'msg':'Project assigned successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def put(self, request, id, format=None):
        # print(request.FILES['file'])
        user = User.objects.get(email=request.user)
        if user is not None:
            try:
                kah = user.kah
                print("Key Account Holder")
                project = Project.objects.get(project_id=id, account_manager=kah)
                # file = request.FILES['file']
                file = request.FILES.get('file')
                print(file)
                if file:
                    project.proposal_upload_file = file
                    project.save()
                return Response({"msg": "File uploaded successfully"}, status=status.HTTP_200_OK)
            except:
                return Response({"error" : "Error in uploading file. Retry!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)