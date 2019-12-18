from django.shortcuts import render, reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password

from .models import VerifyRegistration, Membership, MembershipType, Transaction, BillingInformation

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
    username = request.POST['username']
    email = request.POST['email']
    password = request.POST['password']
    next = request.POST['next']

    # check if this username already exists in the system
    if User.objects.filter(username=username).exists():
        return HttpResponseRedirect(reverse('clc_reg:register_login')+'?message=reg_error')
    else:
        # create user account
        user = User.objects.create_user(username, email, password)
        login(request, user)

        # create new key
        bignumber = create_key(request)

        # create Basic membership
        type = MembershipType.objects.get(name='Basic')     # get Basic object from MembershipType
        basic_membership_type = type                        # set value of membership_type to Basic
        expiration = '2099-12-31 00:00:00-00'               # set expiration far in the future
        create_basic_membership = Membership(               # create the record to be saved
            membership_type=basic_membership_type,          #
            expiration=expiration,                          #
            is_active=True,                                 #
            user_id=request.user.id)                        #
        create_basic_membership.save()                      # save to the database

        # send email with clc_link
        subject = 'Confirm your account'
        page = 'send_new_key'
        clc_code = bignumber
        host = request.META['HTTP_HOST']
        level = ''
        expiration = ''
        send_notification(request, subject, page, clc_code, host, level, expiration)

        if next != '':
            return HttpResponseRedirect(next)
        return HttpResponseRedirect(reverse('clc_reg:index'))

def create_key(request):
    expiry = timezone.now() + timezone.timedelta(days=3)    # calculate expiry 3 days in the future
    bignumber = secrets.token_hex(16)                       # generate 32-digit number
    clc_link = VerifyRegistration(                          # create the record to be saved
        confirmation_code=bignumber,                        #
        expiration=expiry,                                  #
        confirmed=False,                                    #
        user_id=request.user.id)                            #
    clc_link.save()                                         # save to the database
    return bignumber                                        # pass the 32-digit number back to calling function

def send_new_key(request):
    # delete previous key
    old_key = VerifyRegistration.objects.get(user_id=request.user.id)
    old_key.delete()

    # create new key
    bignumber = create_key(request)

    # send email with new clc_link
    subject = 'Confirm your account'
    page = 'send_new_key'
    clc_code = bignumber
    host = request.META['HTTP_HOST']
    level = ''
    expiration = ''
    send_notification(request, subject, page, clc_code, host, level, expiration)

    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=resent')

@login_required
def special_page(request):
    if request.user.is_confirmed():                             # if request.user.is_confirmed = true
        return render(request, 'clc_reg/special_page.html')     # then go to special_page
    else:                                                       # else go to index page with message=pending
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=pending')

@login_required
def special_page2(request):
    return render(request, 'clc_reg/special_page2.html')

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse('clc_reg:index')+'?message=logout')

# Can clc_code, host, level, expiration be optional?
# The problem seems to be with render_to_string (see lines 167, 168).
# Possible solution:
# https://stackoverflow.com/questions/9539921/how-do-i-create-a-python-function-with-optional-arguments
def send_notification(request, subject, page, clc_code, host, level, expiration):
    username = request.user.username
    msg_plain = render_to_string('clc_reg/email.txt', {'username': username, 'page': page, 'clc_code': clc_code, 'host': host, 'level': level, 'expiration': expiration})
    sender = 'Postmaster <postmaster@community-lending-library.org>'
    recipient = [request.user.email]
    msg_html = render_to_string('clc_reg/email.html', {'username': username, 'page': page, 'clc_code': clc_code, 'host': host, 'level': level, 'expiration': expiration})
    try:
        send_mail(subject, msg_plain, sender, recipient, fail_silently=False, html_message=msg_html)
    except:
        print('!!! There was an error sending an email! !!!')

@login_required(login_url='/register_login/')
def confirmation(request):
    clc_code = request.GET.get('clc_code', '')
    message = request.GET.get('message', '')
    context = {'message': message}

    # lookup all code associated with user_id
    valid_code = VerifyRegistration.objects.get(user_id=request.user.id)

    # if confirmed=True, ...
    if valid_code.confirmed:
        # ... redirect to home page and tell user account is already verified
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=verified')

    # if code from url doesn't match code in the database for request.user, ...
    if valid_code.confirmation_code != clc_code:
        # ... redirect to home page and tell user there was a problem
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=error')

    # if valid_code is not expired, ...
    if valid_code.expiration >= timezone.now():
        # ... set "confirmed" = True and save to database
        valid_code.confirmed = True
        valid_code.save()

        # and, send confirmation success email
        subject = 'Account confirmed'
        page = 'confirmed'
        clc_code = ''
        host = request.META['HTTP_HOST']
        level = ''
        expiration = ''
        send_notification(request, subject, page, clc_code, host, level, expiration)

        # then, redirect back to index and tell user account is now confirmed
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=confirmed')
    else:
        # if valid_code is expired, redirect to home page and tell user account is expired
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=expired')

@login_required
def check_membership(request):
    try:
        level = Membership.objects.get(user_id=request.user.id) # lookup Membership by user.id
        if level.expiration <= timezone.now():                  # check if expiration date is in future
            type = MembershipType.objects.get(name='Basic')     # get Basic object from MembershipType
            level.membership_type = type                        # set value of membership_type to Basic
            level.expiration = '2099-12-31 00:00:00-00'         # set expiration far in the future
            level.save()                                        # save new values to database
            return "Expired"
        if level.is_active:                                 # check if membership is active
            return level.membership_type.name
        else:                                               # else go to upsell?message=inactive
            return "Inactive"
    except:
        return "Error"

@login_required
def plus(request):
    message = request.GET.get('message', '')
    next = request.GET.get('next', '')
    context = {
        'message': message,
        'next': next
    }
    if not request.user.is_confirmed():
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=pending')

    level = check_membership(request)
    if level in ['Plus', 'Premium']:                            # check if membership type is Plus
        return render(request, 'clc_reg/plus.html', context)    # then proceed to Plus page
    elif level == 'Basic':                                      # or, redir to Upsell page
        return HttpResponseRedirect(reverse('clc_reg:upsell')+'?message=redir_from_plus')
    elif level == 'Expired':                                    # else go to upsell?message=expired
        return HttpResponseRedirect(reverse('clc_reg:upsell')+'?message=expired')
    elif level == 'Inactive':                                   # else go to upsell?message=inactive
        return HttpResponseRedirect(reverse('clc_reg:inactive')+'?message=inactive')
    else:                                                       # else go to upsell?message=error
        return HttpResponseRedirect(reverse('clc_reg:account_error')+'?message=error')

@login_required
def premium(request):
    message = request.GET.get('message', '')
    next = request.GET.get('next', '')
    context = {
        'message': message,
        'next': next
    }
    if not request.user.is_confirmed():
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=pending')

    level = check_membership(request)
    ### level = request.user.membership_level() # this won't work for Expired or Inactive accounts
    if level == 'Premium':                                      # check if membership type is Premium
        return render(request, 'clc_reg/premium.html', context) # then proceed to Premium page
    elif level == 'Plus':                                       # or, redir to Plus page
        return HttpResponseRedirect(reverse('clc_reg:plus')+'?message=redir_from_premium')
    elif level == 'Basic':                                      # or, redir to Upsell page
        return HttpResponseRedirect(reverse('clc_reg:upsell')+'?message=redir_from_premium')
    elif level == 'Expired':                                    # else go to upsell?message=expired
        return HttpResponseRedirect(reverse('clc_reg:upsell')+'?message=expired')
    elif level == 'Inactive':                                   # else go to upsell?message=inactive
        return HttpResponseRedirect(reverse('clc_reg:inactive')+'?message=inactive')
    else:                                                       # else go to upsell?message=error
        return HttpResponseRedirect(reverse('clc_reg:account_error')+'?message=error')

@login_required
def purchase_membership(request):
    isconfirmed = request.user.is_confirmed()
    level = request.user.membership_level()
    isactive = request.user.membership_isactive()
    isexpired = request.user.membership_isexpired()

    # Redirect to index page if user already has active Premium membership (***Plus members can upgrade***)
    if level == "Premium" and not isexpired and isconfirmed:
        return HttpResponseRedirect(reverse('clc_reg:premium')+'?message=valid_membership')

    # Redirect to Inactive page
    if not isactive:
        return HttpResponseRedirect(reverse('clc_reg:inactive'))

    # Redirect to the index page and tell the user if registration is not confirmed
    if not isconfirmed:
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=pending')
    # otherwise, render the purchase page
    else:
        try:
            existing_billing_info = BillingInformation.objects.get(purchaser_id=request.user.id)
            context = {
                'address1': existing_billing_info.address1,
                'address2': existing_billing_info.address2,
                'city': existing_billing_info.city,
                'state': existing_billing_info.state,
                'zipcode': existing_billing_info.zipcode,
                'country': existing_billing_info.country,
                'billing_exists': True,
            }
            return render(request, 'clc_reg/purchase_membership.html', context)
        except:
            context = {'billing_exists': False}
            return render(request, 'clc_reg/purchase_membership.html', context)

def validate_credit_card(cc_number):            #
    numbers = list(cc_number)                   # Convert the input string into a list
    check_digit = numbers.pop()                 # Slice off the last digit, aka. check digit

    for i in range(len(numbers)):               #
        numbers[i] = int(numbers[i])            # Convert list of strings to integers

    numbers.reverse()                           # Reverse the list of numbers

    for i in range(0, len(numbers), 2):         #
        numbers[i] = numbers[i] * 2             # Double every other element in the reversed list

    for i in range(len(numbers)):               #
        if numbers[i] > 9:                      #
            numbers[i] -= 9                     # Subtract 9 from numbers over 9

    total = str(sum(numbers))                   # Add all the numbers and convert to string

    return check_digit == total[-1]             # If ones digit of that sum matches the check digit, returns True


@login_required
def create_membership(request):
    # Get the form values from request.POST
    membership_type = request.POST['membership_type']
    firstname = request.POST['firstname'].strip()
    lastname = request.POST['lastname'].strip()
    address1 = request.POST['address1'].strip()
    address2 = request.POST['address2'].strip()
    city = request.POST['city'].strip()
    state = request.POST['state']
    zipcode = request.POST['zipcode'].strip()
    country = request.POST['country']
    creditcard = request.POST['creditcard'].strip()
    next = request.POST['next'].strip()

    ###
    ### Belt and suspenders
    ### The following error handling is extra enforcement of app (business) logic.
    ### See purchase_membership() above, lines 257-270
    ###

    # Get the existing registration & membership data
    isconfirmed = request.user.is_confirmed()
    level = request.user.membership_level()
    isactive = request.user.membership_isactive()
    isexpired = request.user.membership_isexpired()

    # Redirect when login/registration is not confirmed
    if not isconfirmed:
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=pending')

    # Redirect when membership is inactive
    if not isactive:
        return HttpResponseRedirect(reverse('clc_reg:inactive'))

    # Check if credit card is valid
    if not validate_credit_card(creditcard):
        return HttpResponseRedirect(reverse('clc_reg:purchase_membership')+'?message=creditcardissue')

    # Redirect if there is a current (not expired), valid Premium membership
    if level == "Premium" and not isexpired:
        return HttpResponseRedirect(reverse('clc_reg:index')+'?message=valid_membership')
    # Otherwise, proceed to create Plus or Premium membership
    else:
        membership = Membership.objects.get(user_id=request.user.id) # lookup Membership by user.id
        type = MembershipType.objects.get(name=membership_type) # get Plus or Premium object from MembershipType
        one_year_term = timezone.now() + timezone.timedelta(days=366) # # calculate 1-year in future

        # Update Membership table - update existing record
        membership.membership_type = type                   # set membership_type to Plus or Premium
        membership.expiration = one_year_term               # set expiration 1-year in future
        membership.is_active = True                         # set is_active = True
        membership.save()                                   # save to the database

        # Update Transaction table - CREATE new record
        transaction = Transaction(                          # create record in the database with the following:
            transaction_date=timezone.now(),                # - set transaction_date to current datetime (UTC)
            item_purchased=membership_type,                 # - takes value from purchase form
            purchaser_id=request.user.id)                   # - takes value from request.user
        transaction.save()                                  # save to the database

        # Update User table - UPDATE existing record
        user_info = User.objects.get(id=request.user.id)    # retrieve record for editing
        user_info.first_name = firstname                    # set new first name
        user_info.last_name = lastname                      # set new last name
        user_info.save()                                    # save to the database

        ### Check for existing record
        try:
            billing_info = BillingInformation.objects.get(purchaser_id=request.user.id)
            billing_info.address1=address1                      # set values from FORM values
            billing_info.address2=address2                      #
            billing_info.city=city                              #
            billing_info.state=state                            #
            billing_info.zipcode=zipcode                        #
            billing_info.country=country                        #
            billing_info.save()                                 # save to the database
        except:
            billing_info = BillingInformation(                  # build an new object from following values
                address1=address1,                              # set values from FORM values
                address2=address2,                              #
                city=city,                                      #
                state=state,                                    #
                zipcode=zipcode,                                #
                country=country,                                #
                purchaser_id=request.user.id)                   #
            billing_info.save()                                 # save to the database

        # Send purchase confirmation email
        subject = 'Membership purchased'
        page = 'purchase'
        level = type
        expiration = one_year_term
        clc_code = ''
        host = ''
        send_notification(request, subject, page, clc_code, host, level, expiration)

        if next != '':
            return HttpResponseRedirect(next)
        if membership_type == 'Plus':
            return HttpResponseRedirect(reverse('clc_reg:plus')+'?message=membership_upgraded')
        elif membership_type == 'Premium':
            return HttpResponseRedirect(reverse('clc_reg:premium')+'?message=membership_upgraded')

@login_required
def inactive(request):
    return render(request, 'clc_reg/inactive.html')

@login_required
def account_error(request):
    return render(request, 'clc_reg/error.html')

@login_required
def upsell(request):
    return render(request, 'clc_reg/upsell.html')

def about(request):
    return render(request, 'clc_reg/about.html')

@login_required
def purchases(request):
    purchases = Transaction.objects.filter(purchaser_id=request.user.id)
    context = {
    'purchases': purchases,
    }
    return render(request, 'clc_reg/purchases.html', context)

@login_required
def my_profile(request):
    message = request.GET.get('message', '')
    user_info = request.user
    try:
        billing_info = BillingInformation.objects.get(purchaser_id=request.user.id)
        context = {
        'message': message,
        'user_info': user_info,
        'billing_info': billing_info,
        'billing_exists': True,
        }
        return render(request, 'clc_reg/my_profile.html', context)
    except:
        context = {
        'message': message,
        'user_info': user_info,
        'billing_exists': False,
        }
        return render(request, 'clc_reg/my_profile.html', context)

@login_required
def save_profile(request):
    firstname = request.POST['firstname'].strip()
    lastname = request.POST['lastname'].strip()

    # Update User table - UPDATE existing record
    user_info = User.objects.get(id=request.user.id)    # retrieve record for editing
    user_info.first_name = firstname                    # set new first name
    user_info.last_name = lastname                      # set new last name
    user_info.save()                                    # save to the database

    ### Check for existing record
    try:
        billing_info = BillingInformation.objects.get(purchaser_id=request.user.id)

        address1 = request.POST['address1'].strip()
        address2 = request.POST['address2'].strip()
        city = request.POST['city'].strip()
        state = request.POST['state']
        zipcode = request.POST['zipcode'].strip()
        country = request.POST['country']

        billing_info.address1=address1                      # set values from FORM values
        billing_info.address2=address2                      #
        billing_info.city=city                              #
        billing_info.state=state                            #
        billing_info.zipcode=zipcode                        #
        billing_info.country=country                        #
        billing_info.save()                                 # save to the database
    except:
        pass
    return HttpResponseRedirect(reverse('clc_reg:my_profile')+'?message=profile_updated')
