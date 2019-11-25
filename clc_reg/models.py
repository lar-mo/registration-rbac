from django.db import models
from django.contrib.auth.models import User

def is_confirmed(user):
    confirmed = user.isConfirmed.get()
    return confirmed.confirmed
User.add_to_class('is_confirmed', is_confirmed)

class VerifyRegistration(models.Model):
    confirmation_code = models.CharField(max_length=200)
    expiration        = models.DateTimeField()
    confirmed         = models.BooleanField()
    user              = models.ForeignKey(User, on_delete=models.PROTECT, related_name='isConfirmed')

    def __str__(self):
        return self.user.username + ': ' + self.confirmation_code
