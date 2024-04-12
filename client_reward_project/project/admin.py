from django.contrib import admin

from .models import Comment, Document, Project

# Register your models here.
admin.site.register(Project)
admin.site.register(Document)
admin.site.register(Comment)