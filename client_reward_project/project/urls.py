from django.urls import path
from .views import AssignView, DisplayAssignedProjects, FileUploadView, KAHListView, ManagersListView, ProjectCreationView, ProjectDetailsView, UnassignedProjectsView

urlpatterns = [
    path('project-creation/', ProjectCreationView.as_view()),
    path('unassigned-projects/', UnassignedProjectsView.as_view()),
    path('find-project/<id>/', ProjectDetailsView.as_view()),
    path('allmanagers/', ManagersListView.as_view()),
    path('allkahs/', KAHListView.as_view()),
    path('assign-project/<id>/', AssignView.as_view()),
    path('display-assigned-projects/', DisplayAssignedProjects.as_view()),
    path('file-upload/<id>/', FileUploadView.as_view()),
]
