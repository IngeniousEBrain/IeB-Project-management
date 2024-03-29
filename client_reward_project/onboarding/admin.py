from django.contrib import admin
from .models import KAH, Client, Manager

# Register your models here.

# admin.site.register(User)
admin.site.register(Client)
admin.site.register(Manager)
admin.site.register(KAH)
# admin.site.register(CustomAdminManagers)