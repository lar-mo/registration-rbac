from django.db import models
from django.contrib.auth.models import User

from django.utils import timezone
import datetime
import django, platform

def get_django_version(user):
    django_version = django.get_version()
    return django_version
User.add_to_class('get_django_version', get_django_version)

def get_python_version(user):
    python_version = platform.python_version()
    return python_version
User.add_to_class('get_python_version', get_python_version)

def is_confirmed(user):
    confirmed = user.isConfirmed.get()
    return confirmed.confirmed
User.add_to_class('is_confirmed', is_confirmed)

def membership_isactive(user):
    isactive = user.Membership.get()
    return isactive.is_active
User.add_to_class('membership_isactive', membership_isactive)

def membership_level(user):
    level = user.Membership.get()
    return level.membership_type.name
User.add_to_class('membership_level', membership_level)

def membership_expiry(user):
    expiry = user.Membership.get()
    return expiry.expiration
User.add_to_class('membership_expiry', membership_expiry)

def membership_isexpired(user):
    expiry = user.Membership.get()
    if expiry.expiration <= timezone.now():
        return True
    return False
User.add_to_class('membership_isexpired', membership_isexpired)

class VerifyRegistration(models.Model):
    confirmation_code = models.CharField(max_length=200)
    expiration        = models.DateTimeField()
    confirmed         = models.BooleanField()
    user              = models.ForeignKey(User, on_delete=models.PROTECT, related_name='isConfirmed')

    def __str__(self):
        return self.user.username + ': ' + self.confirmation_code

class MembershipType(models.Model):
    name       = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Membership(models.Model):
    membership_type = models.ForeignKey(MembershipType, on_delete=models.PROTECT)
    is_active       = models.BooleanField()
    expiration      = models.DateTimeField()
    user            = models.ForeignKey(User, on_delete=models.PROTECT, related_name='Membership')

    def __str__(self):
        return self.user.username + ': ' + self.membership_type.name

class Transaction(models.Model):
     transaction_date   = models.DateTimeField()
     item_purchased     = models.CharField(max_length=200)
     purchaser          = models.ForeignKey(User, on_delete=models.PROTECT, related_name='PurchaseHistory')

     def __str__(self):
         return self.purchaser.username + ': ' + self.item_purchased

class BillingInformation(models.Model):
     address1           = models.CharField(max_length=200)
     address2           = models.CharField(max_length=200)
     city               = models.CharField(max_length=200)
     state              = models.CharField(max_length=20)
     zipcode            = models.CharField(max_length=10)
     country            = models.CharField(max_length=200)
     purchaser          = models.ForeignKey(User, on_delete=models.PROTECT, related_name='BillingInfo')

     def __str__(self):
         return self.purchaser.username
