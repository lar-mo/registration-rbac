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
    message = request.GET.get('message', '')
    next = request.GET.get('next', '')
    context = {
        'message': message,
        'next': next
    }
    return render(request, 'clc_reg/index.html', context)

def register_login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('clc_reg:index'))
    else:
        message = request.GET.get('message', '')
        next = request.GET.get('next', '')
        context = {
            'message': message,
            'next': next
        }
    return render(request, 'clc_reg/register_login.html', context)

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
            return HttpResponseRedirect(reverse('clc_reg:register_login')+'?message=error&next='+next)
        return HttpResponseRedirect(reverse('clc_reg:register_login')+'?message=error')

###
### THIS CODE DOESN'T WORK (reason: unk, perhaps due to deprecated feature)
### When is_active = False, (line 49) 'if user is not None' returns False, expected: True
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

    # check if this username already exists in the system
    if User.objects.filter(username=username).exists():
        return HttpResponseRedirect(reverse('clc_reg:register_login')+'?message=reg_error')
    else:
        user = User.objects.create_user(username, email, password)
        login(request, user)
        create_key(request)
        clc_key = VerifyRegistration.objects.get(user_id=request.user.id)

        # send email with clc_link
        host = request.META['HTTP_HOST']
        subject = 'Confirm your account'
        msg_plain = render_to_string('clc_reg/email.txt', {'page': 'send_new_key', 'clc_code': clc_key.confirmation_code, 'host': host})
        sender = 'Postmaster <postmaster@community-lending-library.org>'
        recipient = [request.user.email]
        msg_html = render_to_string('clc_reg/email.html', {'page': 'send_new_key', 'clc_code': clc_key.confirmation_code, 'host': host})
        try:
            send_mail(subject, msg_plain, sender, recipient, fail_silently=False, html_message=msg_html)
        except:
            print('!!! There was an error sending an email! !!!')

        if next != '':
            return HttpResponseRedirect(next)
        return HttpResponseRedirect(reverse('clc_reg:index'))

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
    host = request.META['HTTP_HOST']
    subject = 'Confirm your account'
    msg_plain = render_to_string('clc_reg/email.txt', {'page': 'send_new_key', 'clc_code': new_key.confirmation_code, 'host': host})
    sender = 'Postmaster <postmaster@community-lending-library.org>'
    recipient = [request.user.email]
    msg_html = render_to_string('clc_reg/email.html', {'page': 'send_new_key', 'clc_code': new_key.confirmation_code, 'host': host})
    try:
        send_mail(subject, msg_plain, sender, recipient, fail_silently=False, html_message=msg_html)
    except:
        print('!!! There was an error sending an email! !!!')

    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=resent')

@login_required
def special_page(request):
    confirmed = VerifyRegistration.objects.get(user_id=request.user.id) # lookup VerifyRegistration by user.id
    if confirmed.confirmed:                                     # if confirmed.confirmed (boolean) = true (1)
        return render(request, 'clc_reg/special_page.html')     # then go to login-required page
    else:                                                       # else go to index?message=pending
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=pending')

@login_required
def special_page2(request):
    return render(request, 'clc_reg/special_page2.html')

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=logout')

@login_required(login_url='/register_login/')
def confirmation(request):
    clc_code = request.GET.get('clc_code', '')
    message = request.GET.get('message', '')
    context = {'message': message}
    # lookup all code associated with user_id
    valid_code = VerifyRegistration.objects.get(user_id=request.user.id)
    # compare code from url vs in the database for user_id
    # if it is valid (strings match, not expried, and not already used))
    if valid_code.confirmation_code == clc_code:
        if valid_code.expiration >= timezone.now():
            if valid_code.confirmed == False:
                # if code in URL matches one of the codes in 'valid codes' array, set "confirmed" = True
                valid_code.confirmed = True
                valid_code.save()
                # send confirmation success email
                subject = 'Account confirmed'
                msg_plain = render_to_string('clc_reg/email.txt', {'page': 'confirmed'})
                sender = 'Postmaster <postmaster@community-lending-library.org>'
                recipient = [request.user.email]
                msg_html = render_to_string('clc_reg/email.html', {'page': 'confirmed'})
                try:
                    send_mail(subject, msg_plain, sender, recipient, fail_silently=False, html_message=msg_html)
                except:
                    print('!!! There was an error sending an email! !!!')
                # then, redirect to home page and tell user they're confirmed
                return HttpResponseRedirect(reverse('clc_reg:index')+'?message=verified')
            else:
                # if confirmed=True, redirect to home page and tell user account is already verified
                return HttpResponseRedirect(reverse('clc_reg:index')+'?message=confirmed')
        else:
            # if valid_code is expired, redirect to home page and tell user account is expired
            return HttpResponseRedirect(reverse('clc_reg:index')+'?message=expired')
    else:
        # else, redirect to home page and tell user there was a problem
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=error')
