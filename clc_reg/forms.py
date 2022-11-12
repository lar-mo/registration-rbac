from django import forms
from captcha.fields import CaptchaField

class RegisterForm(forms.Form):
    captcha = CaptchaField()
