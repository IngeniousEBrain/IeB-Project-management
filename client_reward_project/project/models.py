from django.db import models

from onboarding.models import KAH, Client, Manager, Role

# Create your models here.
class Project(models.Model):
    class Meta:
        db_table = 'project_proposal'
    # status of the project - Accept/Reject/On Hold
    STATUS_CHOICES = (
        ('accepted', 'ACCEPTED'),
        ('rejected', 'REJECTED'),
        ('on_hold', 'ON HOLD'),
    )
 
    project_id = models.BigAutoField(primary_key=True)
    client = models.ForeignKey(
        Client, related_name='projects', on_delete=models.CASCADE)
    account_manager = models.ForeignKey(
        KAH, related_name='managed_projects_account', on_delete=models.CASCADE, null=True, blank=True)
    project_manager = models.ForeignKey(
        Manager, related_name='managed_projects', on_delete=models.CASCADE, null=True, blank=True)
    project_name = models.CharField(max_length=255)
    proposal_upload_file = models.FileField(upload_to='proposals/')
    project_description = models.TextField()
    proposal_date = models.DateField(null=True, blank=True)
    project_cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    type_of_service = models.CharField(max_length=50, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, null=True, blank=True)
    status_date = models.DateField(null=True, blank=True)
    notified_project_manager = models.BooleanField(default=False)
    notified_client = models.BooleanField(default=False)
 
    def __str__(self):
        return self.project_name