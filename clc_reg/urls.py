from django.urls import path
from django.views.generic.base import TemplateView #import TemplateView

from . import views

app_name = 'clc_reg'

urlpatterns = [
    # Displays home page
    path('', views.index, name='index'),

    # Displays login / registration page
    path('register_login/', views.register_login, name='register_login'),

    # Handles the login process
    path('login_user/', views.login_user, name='login_user'),

    # Handles the registration process
    path('register_user/', views.register_user, name='register_user'),

    # Displays protected page 1
    path('special_page/', views.special_page, name='special_page'),

    # Displays protected page 2
    path('special_page2/', views.special_page2, name='special_page2'),

    # Handles logging out a user
    path('logout_user/', views.logout_user, name='logout_user'),

    # Handles validation of clc link
    path('confirmation/', views.confirmation, name='confirmation'),

    # # Handles creation of clc link
    # path('create_key/', views.create_key, name='create_key'),

    # Handles creation of new clc link
    path('send_new_key/', views.send_new_key, name='send_new_key'),

    # Displays Upsell page
    path('upsell/', views.upsell, name='upsell'),

    # Displays About page
    path('about/', views.about, name='about'),

    # Displays Plus page
    path('plus/', views.plus, name='plus'),

    # Displays Premium page
    path('premium/', views.premium, name='premium'),

    # Displays Inactive Account page
    path('inactive/', views.inactive, name='inactive'),

    # Displays Account Error page
    path('account_error/', views.account_error, name='account_error'),

    # Displays Membership purchase page
    path('purchase_membership/', views.purchase_membership, name='purchase_membership'),

    # Handles creation of membership
    path('create_membership/', views.create_membership, name='create_membership'),

    # Displays Purchase History page
    path('purchases/', views.purchases, name='purchases'),

    # Displays My Profile page
    path('my_profile/', views.my_profile, name='my_profile'),

    # Handles My Profile updates
    path('save_profile/', views.save_profile, name='save_profile'),

    path("robots.txt",TemplateView.as_view(template_name="clc_reg/robots.txt", content_type="text/plain")),  #add the robots.txt file

]
