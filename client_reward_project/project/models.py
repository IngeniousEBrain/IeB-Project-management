from django.db import models

from onboarding.models import KAH, Client, Manager, Role, User

# Create your models here.
class Project(models.Model):
    class Meta:
        db_table = 'project_proposal'
    # status of the project - Accept/Reject/On Hold
    BUSINESS_UNIT_CHOICES = (
        ('HBI', 'Healthcare Business Intelligence (BI)'),
        ('HTI', 'Healthcare Technical Intelligence (TI)'),
        ('HIP', 'Healthcare Intellectual Property (IP)'),
        ('HIPI', 'Hitech Intellectual Property (IP)'),
        ('CFH', 'Chemical Food and Hitech (CFH)')
    )

    STATUS_CHOICES = (
        ('accepted', 'ACCEPTED'),
        ('rejected', 'REJECTED'),
        ('on_hold', 'ON HOLD'),
        ('pending', 'PENDING')
    )

    PROJECT_STATUS_CHOICES = (
        ('not_applicable', 'Inapplicable'),
        ('WIP', 'Work In Progress'),
        ('Delivered', 'Delivered')
    )

    BILLING_CHOICES = (
        ('invoiced', 'INVOICED'),
        ('not invoiced', 'NOT INVOICED'),
    )

    CURRENCY_CHOICES = (
        ('usd', 'USD'),
        ('euro', 'EURO'),
        ('inr', 'INR')
    )
 
    project_id = models.BigAutoField(primary_key=True)
    client = models.ForeignKey(
        Client, related_name='projects', on_delete=models.CASCADE)
    account_manager = models.ForeignKey(
        KAH, related_name='managed_projects_account', on_delete=models.CASCADE, null=True, blank=True)
    project_manager = models.ForeignKey(
        Manager, related_name='managed_projects', on_delete=models.CASCADE, null=True, blank=True)
    business_unit = models.CharField(
        max_length=255, choices=BUSINESS_UNIT_CHOICES, null=True, blank=True)
    project_code = models.CharField(max_length=255, blank=True, null=True)
    project_name = models.CharField(max_length=255)
    proposal_upload_file = models.FileField(upload_to='proposals/')
    project_description = models.TextField()
    proposal_date = models.DateField(null=True, blank=True)
    project_cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(
        max_length=10, choices=CURRENCY_CHOICES)
    type_of_service = models.CharField(max_length=50, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    billing_details = models.CharField(
        max_length=20, choices=BILLING_CHOICES, default='not invoiced')
    project_status = models.CharField(
        max_length=20, choices=PROJECT_STATUS_CHOICES, default='not_applicable')
    status_date = models.DateField(null=True, blank=True)
    notified_project_manager = models.BooleanField(default=False)
    notified_client = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return self.project_name
    
class Document(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    document = models.FileField(upload_to='documents/')

class Comment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    comment = models.TextField()
    document = models.FileField(upload_to='comment-documents/', null=True, blank=True)
    created_by = models.ForeignKey(
        User, related_name='created_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):

    CURRENCY_CHOICES = (
        ('usd', 'USD'),
        ('euro', 'EURO'),
        ('inr', 'INR')
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    invoice_number = models.CharField()
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(
        max_length=10, choices=CURRENCY_CHOICES)
    invoice_file = models.FileField(upload_to='invoices/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)