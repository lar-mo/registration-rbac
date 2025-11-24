from django import forms
from turnstile.fields import TurnstileField

class RegisterForm(forms.Form):
    turnstile = TurnstileField()
