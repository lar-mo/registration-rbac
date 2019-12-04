from django.contrib import admin

from .models import VerifyRegistration
from .models import Membership
from .models import MembershipType
from .models import Transaction
from .models import BillingInformation

admin.site.register(VerifyRegistration)
admin.site.register(Membership)
admin.site.register(MembershipType)
admin.site.register(Transaction)
admin.site.register(BillingInformation)
