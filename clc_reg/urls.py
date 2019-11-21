from django.urls import path

from . import views

app_name = 'clc_reg'

urlpatterns = [
    # Display home page
    path('', views.index, name='index'),

    # Display login / registration page
    path('register_login/', views.register_login, name='register_login'),

    # Handles the login process, register_login renders the template
    path('login_user/', views.login_user, name='login_user'),

    # Handles the registration process, register_login renders the template
    path('register_user/', views.register_user, name='register_user'),

    # Display protected page
    path('special_page/', views.special_page, name='special_page'),

    # Handles logging out a user
    path('logout_user/', views.logout_user, name='logout_user'),

    # Handles validation of clc link
    path('confirmation/', views.confirmation, name='confirmation'),

    # Handles creation of clc link
    path('create_key/', views.create_key, name='create_key'),

    # Handles creation of new clc link
    path('send_new_key/', views.send_new_key, name='send_new_key'),

]
