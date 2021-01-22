from django.shortcuts import render

def handler404(request, exception):
    return render(request, 'clc_reg/errors/404.html')
