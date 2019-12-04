from django.db import models
from django.contrib.auth.models import User

def is_confirmed(user):
    confirmed = user.isConfirmed.get()
    return confirmed.confirmed
User.add_to_class('is_confirmed', is_confirmed)

def membership_isactive(user):
    isactive = user.MembershipLevel.get()
    return isactive.is_active
User.add_to_class('membership_isactive', membership_isactive)

def membership_level(user):
    level = user.MembershipLevel.get()
    return level.membership_type.name
User.add_to_class('membership_level', membership_level)

def membership_expiry(user):
    expiry = user.MembershipLevel.get()
    return expiry.expiration
User.add_to_class('membership_expiry', membership_expiry)

class MembershipType(models.Model):
    name       = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class VerifyRegistration(models.Model):
    confirmation_code = models.CharField(max_length=200)
    expiration        = models.DateTimeField()
    confirmed         = models.BooleanField()
    user              = models.ForeignKey(User, on_delete=models.PROTECT, related_name='isConfirmed')

    def __str__(self):
        return self.user.username + ': ' + self.confirmation_code

class Membership(models.Model):
    membership_type = models.ForeignKey(MembershipType, on_delete=models.PROTECT)
    is_active       = models.BooleanField()
    expiration      = models.DateTimeField()
    user            = models.ForeignKey(User, on_delete=models.PROTECT, related_name='MembershipLevel')

    def __str__(self):
        return self.user.username + ': ' + self.membership_type.name

class Transaction(models.Model):
     transaction_date   = models.DateTimeField()
     item_purchased     = models.CharField(max_length=200)
     purchaser          = models.ForeignKey(User, on_delete=models.PROTECT, related_name='PurchaseHistory')

     def __str__(self):
         return self.purchaser.username

class BillingInformation(models.Model):
     address1           = models.CharField(max_length=200)
     address2           = models.CharField(max_length=200)
     city               = models.CharField(max_length=200)
     state              = models.CharField(max_length=20)
     zipcode            = models.CharField(max_length=10)
     creditcard         = models.CharField(max_length=20)
     expiration_month   = models.CharField(max_length=20)
     expiration_year    = models.CharField(max_length=20)
     cid                = models.CharField(max_length=20)
     purchaser          = models.ForeignKey(User, on_delete=models.PROTECT, related_name='BillingInfo')

     def __str__(self):
         return self.purchaser.username
