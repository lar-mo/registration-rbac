from django.contrib import admin
from django.urls import include, path

from . import views

handler404 = views.handler404

urlpatterns = [
    path('', include('clc_reg.urls')),
    path('admin/', admin.site.urls),
]
