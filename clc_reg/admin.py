from django.contrib import admin

from .models import VerifyRegistration
from .models import Membership
from .models import MembershipType

admin.site.register(VerifyRegistration)
admin.site.register(Membership)
admin.site.register(MembershipType)
