from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django.http import FileResponse
from onboarding.models import KAH, Client, Manager, User
from onboarding.serializers import ClientSerializer, KAHSerializer, ManagerSerializer 
from .models import Comment, Document, Invoice, Project
from .serializers import  CommentCreationSerializer, CommentSerializer, DocumentSerializer, InvoiceSerializer, ProjectCreationSerializer, ProjectSerializer
import mimetypes
from django.db.models import Count
from .utils import Util

# Create your views here.
class ProjectCreationView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def post(self, request, format=None):
        print(request.data)
        serializer = ProjectCreationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            if request.user.is_superuser or hasattr(request.user, 'kah'):
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
            return Response({'project': ProjectSerializer(project).data, 'msg':'Project edited successfully'}, status=status.HTTP_200_OK)
        return Response({"errors" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


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
        if request.user.is_superuser or hasattr(request.user, 'kah'):
            clients = Client.objects.all()
            list = ClientSerializer(clients, many=True)
            return Response({'clients': list.data, 'msg':'List of clients populated successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)


class ManagersListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser or hasattr(request.user, 'kah'):
            managers = Manager.objects.all()
            list = ManagerSerializer(managers, many=True)
            return Response({'managers': list.data, 'msg':'List of managers populated successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class KAHListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser or hasattr(request.user, 'kah'):
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
                project = Project.objects.get(project_id=id)
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


class ProjectStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, id, format=None):
        user = User.objects.get(email=request.user)
        print(request.data['project_status'])
        if user is not None:
            try:
                project = Project.objects.get(project_id=id)
                project.project_status = request.data['project_status']
                project.save()
                return Response({"msg": "Project Status updated successfully"}, status=status.HTTP_200_OK)
            except:
                return Response({"error" : "Error in updating project status. Retry!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error" : "User not found"}, status=status.HTTP_404_NOT_FOUND)

class AddInvoiceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def post(self, request, id, format=None):
        if request.user.is_superuser:
            project = Project.objects.get(project_id=id)
            serializer = InvoiceSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save(project=project)
                project.billing_details = 'invoiced'
                return Response({'msg':'Invoice added successfully'}, status=status.HTTP_200_OK)
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Access denied!"}, status=status.HTTP_401_UNAUTHORIZED)

   
class ProposalStatusChart(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        # user = User.objects.get(email=request.user)
        # if user is not None:
        try:
            total_proposals = Project.objects.count()
            total_projects = Project.objects.filter(status = "accepted").count()
            proposal_status_cnt = Project.objects.all().values('status').annotate(count = Count('status'))
            project_status_cnt = Project.objects.exclude(project_status = "not_applicable").values('project_status').annotate(count = Count('project_status'))
            bu_proposal_cnt = Project.objects.all().values('business_unit').annotate(proposal_count = Count('business_unit'))
            bu_project_cnt = Project.objects.exclude(project_status = "not_applicable").values('business_unit').annotate(project_count = Count('business_unit'))
            data = {
                "total_proposals": total_proposals,
                "total_projects": total_projects,
                "proposal_status_cnt": proposal_status_cnt,
                "project_status_cnt": project_status_cnt,
                "bu_proposal_cnt": bu_proposal_cnt,
                "bu_project_cnt": bu_project_cnt,
            }
            return Response({"data": data, "msg": "MIS Report data fetched successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"error" : "Error in populating project status count. Retry!"}, status=status.HTTP_400_BAD_REQUEST)
        # return Response({"error" : "User not found"}, status=status.HTTP_404_NOT_FOUND)

class DashboardView(APIView):

    def get(self, request, format=None):
        start_date = request.GET.get('from_date')
        end_date = request.GET.get('to_date')
        print(start_date, end_date)
        if start_date == None and end_date != None:
            projects = Project.objects.filter(created_at__lte = end_date)
        elif end_date == None and start_date!=None:
            projects = Project.objects.filter(created_at__gte = start_date)
        elif start_date != None and end_date != None:
            projects = Project.objects.filter(created_at__gte = start_date, created_at__lte = end_date)
        else:
            projects = Project.objects.all()
        
        print(projects.count())
        total_proposals = 0
        total_projects = 0
        total_revenue = 0
        total_projected_revenue = 0
    
        overall_proposal_status_cnt = {
            "accepted": 0,
            "rejected": 0,
            "on_hold": 0,
            "pending": 0
        }
        overall_project_status_cnt = {
            "WIP": 0,
            'Delivered': 0
        }
        
        bu_proposal_cnt = projects.values('business_unit').annotate(proposal_count = Count('business_unit'))
        bu_project_cnt = projects.exclude(project_status = "not_applicable").values('business_unit').annotate(project_count = Count('business_unit'))
        
        result = []
        if 'business_unit' in request.GET and len(request.GET.get('business_unit')) != 0:
            get_bu = request.GET.get('business_unit')
            print(get_bu)
            business_units = get_bu.split(",")
            for bu in business_units:
                proposal_cnt = projects.filter(business_unit = bu).count()
                project_cnt = projects.filter(business_unit = bu, status="accepted").count()
                total_proposals += proposal_cnt
                total_projects += project_cnt
                proposal_status_cnt = projects.filter(business_unit = bu).values('status').annotate(count = Count('status'))
                project_status_cnt = projects.filter(business_unit = bu).exclude(project_status = "not_applicable").values('project_status').annotate(count = Count('project_status'))
                for st in proposal_status_cnt:
                    overall_proposal_status_cnt[st['status']] += st['count']
                for st in project_status_cnt:
                    overall_project_status_cnt[st['project_status']] += st['count']
                
                bu_revenue = 0 
                bu_projected_revenue = 0
                for project in projects.filter(business_unit = bu).exclude(project_status = "not_applicable"):
                    converted_ammount = Util.get_conversion(float(project.project_cost), project.currency)
                    print(converted_ammount)
                    bu_projected_revenue += converted_ammount 
                    if project.project_status == "Delivered":
                        bu_revenue += converted_ammount
                
                total_revenue += bu_revenue
                total_projected_revenue += bu_projected_revenue

                bu_data = {
                    "business_unit" : bu,
                    "proposal_cnt": proposal_cnt,
                    "project_cnt": project_cnt,
                    "proposal_status_cnt": proposal_status_cnt,
                    "project_status_cnt": project_status_cnt,
                    "bu_revenue": bu_revenue,
                    "bu_projected_revenue": bu_projected_revenue,
                }
                result.append(bu_data)
        else:
            business_units = ['HBI', 'HTI', 'HIP', 'HIPI', 'CFH']
            for bu in business_units:
                proposal_cnt = projects.filter(business_unit = bu).count()
                project_cnt = projects.filter(business_unit = bu, status="accepted").count()
                total_proposals += proposal_cnt
                total_projects += project_cnt
                proposal_status_cnt = projects.filter(business_unit = bu).values('status').annotate(count = Count('status'))
                project_status_cnt = projects.filter(business_unit = bu).exclude(project_status = "not_applicable").values('project_status').annotate(count = Count('project_status'))
                for st in proposal_status_cnt:
                    overall_proposal_status_cnt[st['status']] += st['count']
                for st in project_status_cnt:
                    overall_project_status_cnt[st['project_status']] += st['count']
                bu_revenue = 0 
                bu_projected_revenue = 0
                for project in projects.filter(business_unit = bu).exclude(project_status = "not_applicable"):
                    converted_ammount = Util.get_conversion(float(project.project_cost), project.currency)
                    print(converted_ammount)
                    bu_projected_revenue += converted_ammount
                    print("bu_projected_revenue " , bu_projected_revenue)
                    if project.project_status == "Delivered":
                        bu_revenue += converted_ammount
                
                total_revenue += bu_revenue
                total_projected_revenue += bu_projected_revenue

                bu_data = {
                    "business_unit": bu,
                    "proposal_cnt": proposal_cnt,
                    "project_cnt": project_cnt,
                    "proposal_status_cnt": proposal_status_cnt,
                    "project_status_cnt": project_status_cnt,
                    "bu_revenue": bu_revenue,
                    "bu_projected_revenue": bu_projected_revenue,
                }
                result.append(bu_data)

        # Convert overall_proposal_status_cnt and overall_project_status_cnt to array
        overall_proposal_status_cnt_array = []
        overall_project_status_cnt_array = []
        for key in overall_proposal_status_cnt:
            d = {}
            d['status'] = key
            d['count'] = overall_proposal_status_cnt[key]
            overall_proposal_status_cnt_array.append(d)

        for key in overall_project_status_cnt:
            d = {}
            d['project_status'] = key
            d['count'] = overall_project_status_cnt[key]
            overall_project_status_cnt_array.append(d)

        data = {
            "total_proposals": total_proposals,
            "total_projects": total_projects,
            "total_revenue": total_revenue,
            "total_projected_revenue": total_projected_revenue,
            "overall_proposal_status_cnt": overall_proposal_status_cnt_array,
            "overall_project_status_cnt": overall_project_status_cnt_array,
            "bu_proposal_cnt": bu_proposal_cnt,
            "bu_project_cnt": bu_project_cnt,
            "comparison": result
        }
        return Response({"data": data, "msg": "MIS Report data fetched successfully"}, status=status.HTTP_200_OK)