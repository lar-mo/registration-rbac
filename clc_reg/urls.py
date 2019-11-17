from django.urls import path

from . import views

app_name = 'clc_reg'
urlpatterns = [
    path('', views.index, name='index'),

    # just handles the registration process, register_login renders the template
    path('register_user/', views.register_user, name='register_user'),

    # just handles the login process, register_login renders the template
    path('login_user/', views.login_user, name='login_user'),

    # protected page
    path('special_pages/', views.special_pages, name='special_pages'),

    # home page
    path('home/', views.home, name='home'),

]
