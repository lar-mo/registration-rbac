from django.db import models
from django.contrib.auth.models import User

class VerifyRegistration(models.Model):
    confirmation_code = models.CharField(max_length=200)
    expiration        = models.DateTimeField()
    confirmed         = models.BooleanField()
    user              = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return self.confirmation_code
