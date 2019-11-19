from django.urls import path

from . import views

app_name = 'clc_reg'

urlpatterns = [
    # Display index page (login / registration)
    path('', views.index, name='index'),

    # Handles the login process, register_login renders the template
    path('login_user/', views.login_user, name='login_user'),

    # Handles the registration process, register_login renders the template
    path('register_user/', views.register_user, name='register_user'),

    # Display protected page
    path('special_page/', views.special_page, name='special_page'),

    # Display home page
    path('home/', views.home, name='home'),

    # Handles logging out a user
    path('logout_user/', views.logout_user, name='logout_user'),

    # Handles validation of clc link
    path('confirmation/', views.confirmation, name='confirmation'),

    # Handles creation of clc link
    path('create_key/', views.create_key, name='create_key'),

    # Handles creation of new clc link
    path('send_new_key/', views.send_new_key, name='send_new_key'),

]
