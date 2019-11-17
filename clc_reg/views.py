from django.shortcuts import render, reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password

def index(request):
    # return render(request, 'clc_reg/index.html')
    message = request.GET.get('message', '')
    next = request.GET.get('next', '')
    context = {
        'message': message,
        'next': next
    }
    return render(request, 'clc_reg/index.html', context)

def home(request):
    return HttpResponse("home page")

def login_user(request):
    username = request.POST['username']
    password = request.POST['password']
    next = request.POST['next']
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        if next != '':
            return HttpResponseRedirect(next)
        return HttpResponseRedirect(reverse('clc_reg:special_page'))

    if next != '':
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=fail&next='+next)
    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=fail')

def register_user(request):
    username = request.POST['username']
    email = request.POST['email']
    password = request.POST['password']
    next = request.POST['next']

    user = User.objects.create_user(username, email, password)
    login(request, user)

@login_required
def special_pages(request):
    return render(request, 'clc_reg/special_pages.html')
