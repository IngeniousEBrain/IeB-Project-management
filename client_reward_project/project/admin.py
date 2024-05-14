from django.contrib import admin

from .models import Cashback, ClientProjectAssociation, Comment, Document, Invoice, Project

# Register your models here.
admin.site.register(Project)
admin.site.register(ClientProjectAssociation)
admin.site.register(Document)
admin.site.register(Comment)
admin.site.register(Invoice)
admin.site.register(Cashback)