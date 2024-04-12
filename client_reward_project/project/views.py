from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django.http import FileResponse
from onboarding.models import KAH, Client, Manager, User
from onboarding.serializers import ClientSerializer, KAHSerializer, ManagerSerializer 
from .models import Comment, Document, Project
from .serializers import  CommentCreationSerializer, CommentSerializer, DocumentSerializer, ProjectCreationSerializer, ProjectSerializer
import mimetypes

# Create your views here.
class ProjectCreationView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def post(self, request, format=None):
        print(request.data)
        # print(request.FILES)
        serializer = ProjectCreationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            if request.user.is_superuser:
                client = Client.objects.get(email = request.data['client'])
                manager = Manager.objects.get(email = request.data['project_manager'])
                kah = KAH.objects.get(email = request.data['account_manager'])
                project = serializer.save(client=client, project_manager=manager, account_manager=kah)
                documents_data = request.FILES.getlist('documents')
                for doc in documents_data:
                    document = Document.objects.create(project=project, document=doc)
                # serializer.save()
            else:
                project = serializer.save(client=self.request.user.client)
            return Response({'project': ProjectSerializer(project).data, 'msg':'Project created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ProjectEditView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def put(self, request, id, format=None):
        print(request.data)
        # print(request.FILES)
        project_instance = Project.objects.get(project_id = id)
        serializer = ProjectCreationSerializer(project_instance, data=request.data)
        print("Serializer")
        if serializer.is_valid(raise_exception=True):
            if request.user.is_superuser:
                client = Client.objects.get(email = request.data['client'])
                manager = Manager.objects.get(email = request.data['project_manager'])
                kah = KAH.objects.get(email = request.data['account_manager'])
                project = serializer.save(client=client, project_manager=manager, account_manager=kah)
                documents_data = request.FILES.getlist('documents')
                for doc in documents_data:
                    document = Document.objects.create(project=project, document=doc)
                # serializer.save()
            # else:
            #     project = serializer.save(client=self.request.user.client)
            return Response({'project': ProjectSerializer(project).data, 'msg':'Project edited successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllProjectsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            all_projects = Project.objects.all()
            projects = ProjectSerializer(all_projects, many=True)
            return Response({'projects': projects.data, 'msg':'Project created successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)

class UnassignedProjectsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            unassigned_projects = Project.objects.filter(project_manager=None, account_manager=None)
            projects = ProjectSerializer(unassigned_projects, many=True)
            return Response({'projects': projects.data, 'msg':'Project created successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)

class ClientsListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            clients = Client.objects.all()
            list = ClientSerializer(clients, many=True)
            return Response({'clients': list.data, 'msg':'List of clients populated successfully'}, status=status.HTTP_200_OK)
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
            try:
                getdocuments = Document.objects.filter(project=id)
                print(getdocuments)
                if getdocuments:
                    documents = DocumentSerializer(getdocuments, many=True).data
                else:
                    documents = []
            except:
                documents = []
            return Response({'project': projectDetails.data, 'documents': documents, 'msg':'Project accessed successfully'}, status=status.HTTP_200_OK)
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
            return Response({'projects': result.data, 'msg':'Project fetched successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
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
                file = request.FILES.get('file')
                print(file)
                if file:
                    project.proposal_upload_file = file
                    project.save()
                return Response({"msg": "File uploaded successfully"}, status=status.HTTP_200_OK)
            except:
                return Response({"error" : "Error in uploading file. Retry!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error" : "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
class DisplayClientProjects(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        user = User.objects.get(email=request.user)
        if user is not None:
            try:
                client = user.client
                print("Client")
                projects = Project.objects.filter(client=client)
            except:
                return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
            result = ProjectSerializer(projects, many=True)
            return Response({'projects': result.data, 'msg':'Project fetched successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
class StatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, id, format=None):
        print(request.data['status'])
        user = User.objects.get(email=request.user)
        if user is not None:
            try:
                client = user.client
                print("Client")
                project = Project.objects.get(project_id=id, client=client)
                project.status = request.data['status']
                project.save()
                return Response({"msg": "Status updated successfully"}, status=status.HTTP_200_OK)
            except:
                return Response({"error" : "Error in updating status. Retry!"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"error" : "User not found"}, status=status.HTTP_404_NOT_FOUND)
  
        
class DownloadProposalView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id, format=None):
        try:
            proposal = Project.objects.get(project_id = id)
            proposal_file = proposal.proposal_upload_file.path
            filename = proposal.proposal_upload_file.name
            file = open(proposal_file, 'rb')
            content_type, _ = mimetypes.guess_type(filename)
            response = FileResponse(file, content_type=content_type, status=status.HTTP_200_OK)
            response['Content-Disposition'] = 'attachment; filename="%s"' % filename
            return response
        except:
            return Response({"error": "Error in downloading file"}, status=status.HTTP_400_BAD_REQUEST)
        
class DownloadDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id, format=None):
        try:
            document = Document.objects.get(id = id)
            filepath = document.document.path
            filename = document.document.name
            file = open(filepath, 'rb')
            content_type, _ = mimetypes.guess_type(filename)
            response = FileResponse(file, content_type=content_type, status=status.HTTP_200_OK)
            response['Content-Disposition'] = 'attachment; filename="%s"' % filename
            return response
        except:
            return Response({"error": "Error in downloading file"}, status=status.HTTP_400_BAD_REQUEST)
        

class AddCommentView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def post(self, request, id, format=None):
        print(request.data)
        project = Project.objects.get(project_id=id)
        serializer = CommentCreationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(project=project, created_by=request.user)
            return Response({'msg':'Comment added successfully'}, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CommentByProjectIdView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id, format=None):
        try:
            getcomments = Comment.objects.filter(project=id)
            print(getcomments)
            if getcomments:
                comments = CommentSerializer(getcomments, many=True).data
            else:
                comments = []
            return Response({'comments': comments, 'msg':'Comments accessed successfully'}, status=status.HTTP_200_OK)
        except:
            return Response({"error" : "Error in fetching comments"}, status=status.HTTP_401_UNAUTHORIZED)
        