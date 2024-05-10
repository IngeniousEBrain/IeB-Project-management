from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django.http import FileResponse
from onboarding.models import KAH, Client, Manager, Organization, User
from onboarding.serializers import ClientSerializer, KAHSerializer, ManagerSerializer, OrganizationSerializer 
from .models import Cashback, ClientProjectAssociation, Comment, Document, Invoice, Project
from .serializers import  ClientProjectAssociationSerializer, CommentCreationSerializer, CommentSerializer, DocumentSerializer, InvoiceSerializer, ProjectCreationSerializer, ProjectSerializer
import mimetypes
from django.db.models import Count
from .utils import Util
from datetime import datetime
import pandas as pd

# Create your views here.

def validateCouponCode(client, coupon):
    possible_yearly_coupon = 'Y'+ client.first_name.upper() + client.yearly_discount
    possible_quarterly_coupon = 'Q'+ client.first_name.upper() + client.quarterly_discount
    projects = Project.objects.filter(clientprojectassociation__client=client)
    month = datetime.now().month
    year = datetime.now().year if month >= 4 else datetime.now().year - 1
    df = pd.DataFrame().from_records(projects.filter(created_at__year__in = [year, year-1, year+1]).exclude(project_status='not_applicable').values(
        'project_id',
        'project_name',
        'project_cost',
        'project_status',
        'currency',
        'created_at'
    ))
    print(df)

    if not df.empty:
        df = df.loc[df['project_status'] == 'Delivered'] 
        df['project_cost'] = pd.to_numeric(df['project_cost'])
        df['Revenue_INR'] = df.apply(lambda x: Util.get_conversion(x['project_cost'], x['currency']), axis=1)
        print(df)
        
        df = df.groupby(pd.Grouper(key='created_at', freq='ME')).sum()
        df['month_number'] = df.index.strftime('%m')
        df['month'] = df.index.strftime('%B')
        df['year'] = df.index.strftime('%Y')
        df['month_number'] = pd.to_numeric(df['month_number'])
        df['year'] = pd.to_numeric(df['year'])
    
    yearly_revenue = 0
    q1 = 0
    q2 = 0
    q3 = 0
    q4 = 0

    for index, row in df.iterrows():
        if (row['month_number'] >= 4) & (row['year'] == year): 
            yearly_revenue += row['Revenue_INR']
            if row['month'] in ['April', 'May', 'June']:
                q1 += row['Revenue_INR']
            elif row['month'] in ['July', 'August', 'September']:
                q2 += row['Revenue_INR']
            elif row['month'] in ['October', 'November', 'December']:
                q3 += row['Revenue_INR']
        if (row['month_number'] < 4) & (row['year'] == year+1): 
            yearly_revenue += row['Revenue_INR']
            if row['month'] in ['January', 'February', 'March']:
                q4 += row['Revenue_INR']

    if client.yearly_amount is not None:
        yearly_cutoff = Util.get_conversion(float(client.yearly_amount), client.cashback_currency)

        if coupon[0] == 'Y' and coupon == possible_yearly_coupon and yearly_revenue > yearly_cutoff:
            return True
        
    if client.quarterly_amount is not None:
        quarterly_cutoff = Util.get_conversion(float(client.quarterly_amount), client.cashback_currency)
        if (month >= 4): 
            if month>=4 and month<7:
                quarterly_revenue = q1
            elif month>=7 and month<10:
                quarterly_revenue = q2
            elif month>=10 and month<=12:
                quarterly_revenue = q3
        if (month < 4):
            quarterly_revenue = q4
        if coupon[0] == 'Q' and coupon == possible_quarterly_coupon and quarterly_revenue > quarterly_cutoff:
            return True
    return False
        

class ProjectCreationView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def post(self, request, format=None):
        print(request.data)
        user = User.objects.get(email = request.user.email)
        serializer = ProjectCreationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            if request.user.is_superuser or hasattr(request.user, 'kah'):
                manager = Manager.objects.get(email = request.data['project_manager'])
                kah = KAH.objects.get(email = request.data['account_manager'])
                project = serializer.save(project_manager=manager, account_manager=kah)
                clients = request.data.getlist('client')
                print(clients)
                for client in clients:
                    client_data = Client.objects.get(email = client)
                    client_project_association = ClientProjectAssociation.objects.get_or_create(client=client_data, allocated_by=user)[0]
                    client_project_association.projects.add(project)
                documents_data = request.FILES.getlist('documents')
                for doc in documents_data:
                    document = Document.objects.create(project=project, document=doc)
            else:
                client = request.user.client
                project = serializer.save()
                client_project_association = ClientProjectAssociation.objects.get_or_create(client=client, allocated_by=client)[0]
                client_project_association.projects.add(project)
                if request.data['coupon'] != "":
                    coupon = request.data['coupon']
                    result = validateCouponCode(client, coupon)
                    if result:
                        if coupon[0] == 'Y':
                            scheme = "Yearly"
                            cutoff_amount = client.yearly_amount
                            discount = client.yearly_discount
                        elif coupon[0] == 'Q':
                            scheme = "Quarterly"
                            cutoff_amount = client.quarterly_amount
                            discount = client.quarterly_discount
                        offer = Cashback.objects.create(project=project, availed_by=client, scheme=scheme, cutoff_amount=cutoff_amount, discount=discount)
            return Response({'project': ProjectSerializer(project).data, 'msg':'Project created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ProjectEditView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def put(self, request, id, format=None):
        print(request.data)
        user = User.objects.get(email = request.user.email)
        project_instance = Project.objects.get(project_id = id)
        serializer = ProjectCreationSerializer(project_instance, data=request.data)
        existing_clients = ClientProjectAssociation.objects.filter(projects=project_instance)
        existing_clients_obj = ClientProjectAssociationSerializer(existing_clients, many=True).data
        existing_emails = [obj['client']['email'] for obj in existing_clients_obj]

        if serializer.is_valid(raise_exception=True):
            if request.user.is_superuser:
                manager = Manager.objects.get(email = request.data['project_manager'])
                kah = KAH.objects.get(email = request.data['account_manager'])
                project = serializer.save(project_manager=manager, account_manager=kah)
                clients = request.data.getlist('client')
                print(clients)

                for email in existing_emails:
                    if email not in clients:
                        client_data = Client.objects.get(email = email)
                        admin_client_project_association = ClientProjectAssociation.objects.get(client=client_data, allocated_by=request.user)
                        admin_client_project_association.projects.remove(project)
                        client_project_association = ClientProjectAssociation.objects.get(client=client_data, allocated_by=client_data.head)
                        client_project_association.projects.remove(project)
                
                for client in clients:
                    client_data = Client.objects.get(email = client)
                    client_project_association = ClientProjectAssociation.objects.get_or_create(client=client_data, allocated_by=user)[0]
                    client_project_association.projects.add(project)
                
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
        elif hasattr(request.user, 'client') and request.user.client.sub_role == 'Head':
            clients = Client.objects.filter(head=request.user)
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
    
class OrganizationsListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            orgs = Organization.objects.all()
            list = OrganizationSerializer(orgs, many=True)
            return Response({'orgs': list.data, 'msg':'List of orgs populated successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)

class HeadListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        if request.user.is_superuser:
            heads = Client.objects.filter(sub_role='Head')
            list = ClientSerializer(heads, many=True)
            return Response({'heads': list.data, 'msg':'List of heads populated successfully'}, status=status.HTTP_200_OK)
        return Response({"error" : "Access Denied"}, status=status.HTTP_401_UNAUTHORIZED)
    
class ProjectDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id, format=None):
        if request.user.is_superuser:
            project = Project.objects.get(project_id=id)
            projectDetails = ProjectSerializer(project)
            try:
                getclients = ClientProjectAssociation.objects.filter(projects=project).select_related('client')
                print(getclients)
                if getclients:
                    print('Projects')
                    clients = [ClientSerializer(association.client).data for association in getclients]
                    print(clients)
                else:
                    clients = []
            except:
                clients = []
            try:
                getdocuments = Document.objects.filter(project=id)
                if getdocuments:
                    documents = DocumentSerializer(getdocuments, many=True).data
                else:
                    documents = []
            except:
                documents = []
            return Response({'project': projectDetails.data, 'clients': clients, 'documents': documents, 'msg':'Project accessed successfully'}, status=status.HTTP_200_OK)
        elif hasattr(request.user, 'client') and request.user.client.sub_role == "Head":
            project = Project.objects.get(project_id=id)
            projectDetails = ProjectSerializer(project)
            try:
                getclients = ClientProjectAssociation.objects.filter(projects=project).select_related('client')
                print(getclients)
                if getclients:
                    clients = [ClientSerializer(association.client).data for association in getclients if association.client.head == request.user.client]
                    print(clients)
                else:
                    clients = []
            except:
                clients = []
            try:
                getdocuments = Document.objects.filter(project=id)
                if getdocuments:
                    documents = DocumentSerializer(getdocuments, many=True).data
                else:
                    documents = []
            except:
                documents = []
            return Response({'project': projectDetails.data, 'clients': clients, 'documents': documents, 'msg':'Project accessed successfully'}, status=status.HTTP_200_OK)
        
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

class TeamProjectAllocationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id, format=None):
        if request.user.client.sub_role == "Head":
            project = Project.objects.get(project_id=id)
            existing_clients = ClientProjectAssociation.objects.filter(projects=project)
            existing_clients_obj = ClientProjectAssociationSerializer(existing_clients, many=True).data
            existing_emails = [obj['client']['email'] for obj in existing_clients_obj]
            clients = request.data.getlist('client')

            for email in existing_emails:
                if email not in clients:
                    client_data = Client.objects.get(email = email)
                    client_project_association = ClientProjectAssociation.objects.get(client=client_data)
                    client_project_association.projects.remove(project)

            for client in clients:
                client_data = Client.objects.get(email = client)
                client_project_association = ClientProjectAssociation.objects.get_or_create(client=client_data, allocated_by=request.user)[0]
                client_project_association.projects.add(project)
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
                projects = Project.objects.filter(clientprojectassociation__client=client)
                print(projects)
            except:
                return Response({"error" : "Error fetching proposals"}, status=status.HTTP_400_BAD_REQUEST)
            
            result = ProjectSerializer(projects, many=True).data
            print(result)
            return Response({'projects': result, 'msg':'Project fetched successfully'}, status=status.HTTP_200_OK)
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
            end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S.%f%z')
            current_month = end_date.month
            current_year = end_date.year if current_month >= 4 else end_date.year - 1
        elif end_date == None and start_date!=None:
            projects = Project.objects.filter(created_at__gte = start_date)
            current_month = datetime.now().month
            current_year = datetime.now().year if current_month >= 4 else datetime.now().year - 1
        elif start_date != None and end_date != None:
            projects = Project.objects.filter(created_at__gte = start_date, created_at__lte = end_date)
            end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S.%f%z')
            current_month = end_date.month
            current_year = end_date.year if current_month >= 4 else end_date.year - 1
        else:
            projects = Project.objects.all()
            current_month = datetime.now().month
            current_year = datetime.now().year if current_month >= 4 else datetime.now().year - 1
        
        print(current_month, current_year)
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

        df = pd.DataFrame().from_records(Project.objects.filter(created_at__year__in=[current_year, current_year-1, current_year+1]).values(
            'project_id',
            'project_name',
            'project_cost',
            'project_status',
            'currency',
            'created_at'
        ))

        print(df)
        
        revenue_df = df.loc[df['project_status'] == 'Delivered'] 

        revenue_df['project_cost'] = pd.to_numeric(revenue_df['project_cost'])
        revenue_df['Revenue_INR'] = revenue_df.apply(lambda x: Util.get_conversion(x['project_cost'], x['currency']), axis=1)
        revenue_df = revenue_df.drop(['project_id', 'project_name', 'project_cost','project_status','currency'], axis=1)

        revenue_df = revenue_df.groupby(pd.Grouper(key='created_at', freq='ME')).sum()
        print(revenue_df)
        revenue_df['month_number'] = revenue_df.index.strftime('%m')
        revenue_df['month'] = revenue_df.index.strftime('%B')
        revenue_df['year'] = revenue_df.index.strftime('%Y')
        revenue_df['month_number'] = pd.to_numeric(revenue_df['month_number'])
        revenue_df['year'] = pd.to_numeric(revenue_df['year'])
        print(revenue_df)
        yearly_revenue = []
        q1 = []
        q2 = []
        q3 = []
        q4 = []
        # revenue_dict = revenue_df.to_dict()
        # print(revenue_dict)
        for index, row in revenue_df.iterrows():
            d = {}
            if (row['month_number'] >= 4) & (row['year'] == current_year): 
                d['month'] = row['month']
                d['revenue'] = row['Revenue_INR']
                yearly_revenue.append(d)
                if row['month'] in ['April', 'May', 'June']:
                    q1.append(d)
                elif row['month'] in ['July', 'August', 'September']:
                    q2.append(d)
                elif row['month'] in ['October', 'November', 'December']:
                    q3.append(d)
            if (row['month_number'] < 4) & (row['year'] == current_year+1): 
                d['month'] = row['month']
                d['revenue'] = row['Revenue_INR']
                yearly_revenue.append(d)
                if row['month'] in ['January', 'February', 'March']:
                    q4.append(d)
            
            

        print(yearly_revenue, q1, q2, q3, q4)

        data = {
            "total_proposals": total_proposals,
            "total_projects": total_projects,
            "total_revenue": total_revenue,
            "total_projected_revenue": total_projected_revenue,
            "overall_proposal_status_cnt": overall_proposal_status_cnt_array,
            "overall_project_status_cnt": overall_project_status_cnt_array,
            "bu_proposal_cnt": bu_proposal_cnt,
            "bu_project_cnt": bu_project_cnt,
            "comparison": result,
            "yearly_revenue": yearly_revenue,
            "q1": q1,
            "q2": q2,
            "q3": q3,
            "q4": q4
        }
        return Response({"data": data, "msg": "MIS Report data fetched successfully"}, status=status.HTTP_200_OK)


class ClientRevenueView(APIView):
    def get(self, request, id, format=None):
        print(id)
        client = Client.objects.get(email=id)
        projects = Project.objects.filter(clientprojectassociation__client=client)
        total_proposals = projects.count()
        total_projects = projects.filter(status='accepted').count()
        month = datetime.now().month
        year = datetime.now().year if month >= 4 else datetime.now().year - 1
        df = pd.DataFrame().from_records(projects.filter(created_at__year__in = [year, year-1, year+1]).exclude(project_status='not_applicable').values(
            'project_id',
            'project_name',
            'project_cost',
            'project_status',
            'currency',
            'created_at'
        ))
        print(df)

        if not df.empty:
            df = df.loc[df['project_status'] == 'Delivered'] 
            df['project_cost'] = pd.to_numeric(df['project_cost'])
            df['Revenue_INR'] = df.apply(lambda x: Util.get_conversion(x['project_cost'], x['currency']), axis=1)
            print(df)
            
            df = df.groupby(pd.Grouper(key='created_at', freq='ME')).sum()
            df['month_number'] = df.index.strftime('%m')
            df['month'] = df.index.strftime('%B')
            df['year'] = df.index.strftime('%Y')
            df['month_number'] = pd.to_numeric(df['month_number'])
            df['year'] = pd.to_numeric(df['year'])
        
        yearly_revenue = 0
        q1 = 0
        q2 = 0
        q3 = 0
        q4 = 0

        for index, row in df.iterrows():
            if (row['month_number'] >= 4) & (row['year'] == year): 
                yearly_revenue += row['Revenue_INR']
                if row['month'] in ['April', 'May', 'June']:
                    q1 += row['Revenue_INR']
                elif row['month'] in ['July', 'August', 'September']:
                    q2 += row['Revenue_INR']
                elif row['month'] in ['October', 'November', 'December']:
                    q3 += row['Revenue_INR']
            if (row['month_number'] < 4) & (row['year'] == year+1): 
                yearly_revenue += row['Revenue_INR']
                if row['month'] in ['January', 'February', 'March']:
                    q4 += row['Revenue_INR']

        data = {
            'total_proposals': total_proposals,
            'total_projects': total_projects,
            'yearly_revenue': yearly_revenue,
            'q1': q1,
            'q2': q2,
            'q3': q3,
            'q4': q4
        } 

        return Response({"data": data, "msg": "Client Revenue fetched successfully"}, status=status.HTTP_200_OK)


class EmployeeRevenueView(APIView):
    def get(self, request, id, format=None):
        print(id)
        employee = User.objects.get(email=id)
        if hasattr(employee, 'manager'):
            projects = Project.objects.filter(project_manager=employee.manager)
        if hasattr(employee, 'kah'):
            projects = Project.objects.filter(account_manager=employee.kah)
        total_proposals = projects.count()
        total_projects = projects.filter(status='accepted').count()
        month = datetime.now().month
        year = datetime.now().year if month >= 4 else datetime.now().year - 1
        df = pd.DataFrame().from_records(projects.filter(created_at__year__in = [year, year-1, year+1]).exclude(project_status='not_applicable').values(
            'project_id',
            'project_name',
            'project_cost',
            'project_status',
            'currency',
            'created_at'
        ))
        print(df)

        if not df.empty:
            df = df.loc[df['project_status'] == 'Delivered'] 
            df['project_cost'] = pd.to_numeric(df['project_cost'])
            df['Revenue_INR'] = df.apply(lambda x: Util.get_conversion(x['project_cost'], x['currency']), axis=1)
            print(df)
            
            df = df.groupby(pd.Grouper(key='created_at', freq='ME')).sum()
            df['month_number'] = df.index.strftime('%m')
            df['month'] = df.index.strftime('%B')
            df['year'] = df.index.strftime('%Y')
            df['month_number'] = pd.to_numeric(df['month_number'])
            df['year'] = pd.to_numeric(df['year'])
        
        yearly_revenue = 0
        q1 = 0
        q2 = 0
        q3 = 0
        q4 = 0

        for index, row in df.iterrows():
            if (row['month_number'] >= 4) & (row['year'] == year): 
                yearly_revenue += row['Revenue_INR']
                if row['month'] in ['April', 'May', 'June']:
                    q1 += row['Revenue_INR']
                elif row['month'] in ['July', 'August', 'September']:
                    q2 += row['Revenue_INR']
                elif row['month'] in ['October', 'November', 'December']:
                    q3 += row['Revenue_INR']
            if (row['month_number'] < 4) & (row['year'] == year+1): 
                yearly_revenue += row['Revenue_INR']
                if row['month'] in ['January', 'February', 'March']:
                    q4 += row['Revenue_INR']

        data = {
            'total_proposals': total_proposals,
            'total_projects': total_projects,
            'yearly_revenue': yearly_revenue,
            'q1': q1,
            'q2': q2,
            'q3': q3,
            'q4': q4
        } 

        return Response({"data": data, "msg": "Employee Revenue fetched successfully"}, status=status.HTTP_200_OK)


class RuleView(APIView):
    def post(self, request, id, format=None):
        if request.user.is_superuser:
            data = request.data
            print(data)
            client = Client.objects.get(email=id)
            if client is not None:
                try:
                    client.yearly_amount = request.data['yearly_amount']
                    client.quarterly_amount = request.data['quarterly_amount']
                    client.yearly_discount = request.data['yearly_discount']
                    client.quarterly_discount = request.data['quarterly_discount']
                    client.cashback_currency = request.data['cashback_currency']
                    client.save()
                    return Response({"msg": "Rule added successfully"}, status=status.HTTP_200_OK) 
                except:
                    return Response({"error": "Failed to set rule"}, status=status.HTTP_400_BAD_REQUEST) 
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND) 
        return Response({"error": "You are not authorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
class ValidateCoupon(APIView):
    def post(self, request, format=None):
        coupon = request.data['coupon']
        client = Client.objects.get(email=request.user)
        result = validateCouponCode(client, coupon)
        if result:
            return Response({"msg": "Coupon code applied"}, status=status.HTTP_200_OK)
        return Response({"error": "Coupon code failed"}, status=status.HTTP_400_BAD_REQUEST)