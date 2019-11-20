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
            return HttpResponseRedirect(reverse('clc_reg:index')+'?message=error&next='+next)
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=error')

###
### THIS CODE DOESN'T WORK (reason: unk, perhaps due to deprecated feature)
### When is_active = False, (line 49) 'if user is not None' returns None, expected: <username>
### Code: https://stackoverflow.com/questions/29742845/django-how-do-i-use-is-active-of-auth-user-table
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
    # fix error when you try to register with same username
    username = request.POST['username']
    email = request.POST['email']
    password = request.POST['password']
    next = request.POST['next']

    user = User.objects.create_user(username, email, password)
    login(request, user)
    create_key(request)
    clc_key = VerifyRegistration.objects.get(user_id=request.user.id)

    # send email with clc_link
    subject = 'Confirm you account'
    msg_plain = render_to_string('clc_reg/email.txt', {'page': 'send_new_key', 'clc_code': clc_key.confirmation_code})
    sender = 'Postmaster <postmaster@community-lending-library.org>'
    recipient = [request.user.email]
    msg_html = render_to_string('clc_reg/email.html', {'page': 'send_new_key', 'clc_code': clc_key.confirmation_code})
    try:
        send_mail(subject, msg_plain, sender, recipient, fail_silently=False, html_message=msg_html)
    except:
        print('!!! There was an error sending an email! !!!')

    if next != '':
        return HttpResponseRedirect(next)
    return HttpResponseRedirect(reverse('clc_reg:home'))

def create_key(request):
    expiry = timezone.now() + timezone.timedelta(days=3)
    clc_link = VerifyRegistration(confirmation_code=secrets.token_hex(16), expiration=expiry, confirmed=False, user_id=request.user.id)
    clc_link.save()

def send_new_key(request):
    # delete previous key
    old_key = VerifyRegistration.objects.get(user_id=request.user.id)
    old_key.delete()
    # create new key
    create_key(request)
    new_key = VerifyRegistration.objects.get(user_id=request.user.id)
    # send email with new clc_link
    subject = 'Confirm you account'
    msg_plain = render_to_string('clc_reg/email.txt', {'page': 'send_new_key', 'clc_code': new_key.confirmation_code})
    sender = 'Postmaster <postmaster@community-lending-library.org>'
    recipient = [request.user.email]
    msg_html = render_to_string('clc_reg/email.html', {'page': 'send_new_key', 'clc_code': new_key.confirmation_code})
    try:
        send_mail(subject, msg_plain, sender, recipient, fail_silently=False, html_message=msg_html)
    except:
        print('!!! There was an error sending an email! !!!')

    return HttpResponseRedirect(reverse('clc_reg:home')+'?message=resent')

# @login_required # this is optional
# need to account for multiple keys for the user.
def special_page(request):
    confirmed = VerifyRegistration.objects.get(user_id=request.user.id) # lookup VerifyRegistration by user.id
    if confirmed.confirmed:                                     # if confirmed.confirmed (boolean) = true (1)
        return render(request, 'clc_reg/special_page.html')     # then go to login-required page
    else:                                                       # else go to index?message=pending
        return HttpResponseRedirect(reverse('clc_reg:home')+'?message=pending')

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=logout')

# @login_required
def confirmation(request):
    clc_code = request.GET.get('clc_code', '')
    message = request.GET.get('message', '')
    context = {'message': message}
    # lookup all code associated with user_id
    valid_code = VerifyRegistration.objects.get(user_id=request.user.id)
    # compare code from url vs in the database for user_id
    # if it is valid (not expired and string match, or already used))
    if valid_code.expiration >= timezone.now():
        if valid_code.confirmation_code == clc_code:
            if valid_code.confirmed == False:
                # if code in URL matches one of the codes in 'valid codes' array, set "confirmed" = True
                valid_code.confirmed = True
                valid_code.save()
                # then, redirect to home page and tell user they're confirmed
                return HttpResponseRedirect(reverse('clc_reg:home')+'?message=verified')
            else:
                # if confirmed=True, redirect to home page and tell user account is already verified
                return HttpResponseRedirect(reverse('clc_reg:home')+'?message=confirmed')
        else:
            # else, redirect to home page and tell user there was a problem
            return HttpResponseRedirect(reverse('clc_reg:home')+'?message=error')
    else:
        # if valid_code is expired, redirect to home page and tell user account is expired
        return HttpResponseRedirect(reverse('clc_reg:home')+'?message=expired')
