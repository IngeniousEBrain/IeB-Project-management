from django.contrib import admin
from .models import KAH, Client, Manager, Organization

# Register your models here.

admin.site.register(Client)
admin.site.register(Manager)
admin.site.register(KAH)
admin.site.register(Organization)