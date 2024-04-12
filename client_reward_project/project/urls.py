from django.urls import path
from .views import AddCommentView, AllProjectsView, AssignView, ClientsListView, CommentByProjectIdView, DisplayAssignedProjects, DisplayClientProjects, DownloadDocumentView, DownloadProposalView, FileUploadView, KAHListView, ManagersListView, ProjectCreationView, ProjectDetailsView, ProjectEditView, StatusUpdateView, UnassignedProjectsView

urlpatterns = [
    path('project-creation/', ProjectCreationView.as_view()),
    path('edit-project/<id>/', ProjectEditView.as_view()),
    path('all-projects/', AllProjectsView.as_view()),
    path('unassigned-projects/', UnassignedProjectsView.as_view()),
    path('find-project/<id>/', ProjectDetailsView.as_view()),
    path('allclients/', ClientsListView.as_view()),
    path('allmanagers/', ManagersListView.as_view()),
    path('allkahs/', KAHListView.as_view()),
    path('assign-project/<id>/', AssignView.as_view()),
    path('display-assigned-projects/', DisplayAssignedProjects.as_view()),
    path('display-client-projects/', DisplayClientProjects.as_view()),
    path('file-upload/<id>/', FileUploadView.as_view()),
    path('update-status/<id>/', StatusUpdateView.as_view()),
    path('download-proposal-file/<id>/', DownloadProposalView.as_view()),
    path('download-document/<id>/', DownloadDocumentView.as_view()),
    path('<id>/add-comment/', AddCommentView.as_view()),
    path('<id>/allcomments/', CommentByProjectIdView.as_view()),
]
