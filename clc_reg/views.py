from django.shortcuts import render, reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password

from .models import VerifyRegistration

import secrets

def index(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('clc_reg:home'))
    else:
        message = request.GET.get('message', '')
        next = request.GET.get('next', '')
        context = {
            'message': message,
            'next': next
        }
    return render(request, 'clc_reg/index.html', context)

def home(request):
    message = request.GET.get('message', '')
    next = request.GET.get('next', '')
    context = {
        'message': message,
        'next': next
    }
    return render(request, 'clc_reg/home.html', context)

def login_user(request):
    username = request.POST['username']
    password = request.POST['password']
    next = request.POST['next']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            if next != '':
                return HttpResponseRedirect(next)
            return HttpResponseRedirect(reverse('clc_reg:special_page'))
    else:
        if next != '':
            return HttpResponseRedirect(reverse('clc_reg:index')+'?message=fail&next='+next)
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=fail')

###
### THIS CODE DOESN'T WORK (and I don't think it will.)
### https://stackoverflow.com/questions/29742845/django-how-do-i-use-is-active-of-auth-user-table
### when is_active = False, then 'if user is not None' returns False (line 49)
###
    # if user is not None:  #to check whether user is available or not?
    #     # the password verified for the user
    #     if user.is_active:
    #         return HttpResponse("User is valid, active and authenticated")
    #     else:
    #         return HttpResponse("The password is valid, but the account has been disabled!")
    # else:
    #     # the authentication system was unable to verify the username and password
    #     return HttpResponse("The username and password were incorrect.")

def register_user(request):
    username = request.POST['username']
    email = request.POST['email']
    password = request.POST['password']
    next = request.POST['next']

    user = User.objects.create_user(username, email, password)
    login(request, user)

    expiry = timezone.now() + timezone.timedelta(days=3)
    clc_link = VerifyRegistration(confirmation_code=secrets.token_hex(16), expiration=expiry, confirmed=False, user_id=user.id)
    clc_link.save()

    if next != '':
        return HttpResponseRedirect(next)
    return HttpResponseRedirect(reverse('clc_reg:home'))

@login_required
def special_page(request):
    confirmed = VerifyRegistration.objects.get(user_id=request.user.id) # lookup VerifyRegistration by user.id
    if confirmed.confirmed:                                     # if confirmed.confirmed (boolean) = true (1)
        return render(request, 'clc_reg/special_page.html')     # then go to login-required page
    else:                                                       # else go to index?message=pending
        return HttpResponseRedirect(reverse('clc_reg:home')+'?message=pending')

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=logout')

@login_required
def confirmation_page(request):
    clc_code = request.GET.get('clc_code', '')
    message = request.GET.get('message', '')
    context = {'message': message}
    print(request.user.id)
    # lookup all code associated with user_id
    valid_codes = VerifyRegistration.objects.get(user_id=request.user.id)
    print(valid_codes)
    # compare code from url vs in the database for user_id
    # if it is valid (string match and not expired)
    # if code in URL matches one of the codes in 'valid codes' array, set "confirmed" = True
    

    # then, tell user their confirmed.
    # return render(request, 'clc_reg/index.html', context)
    return HttpResponse("Hello world!")
