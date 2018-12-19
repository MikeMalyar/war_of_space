from django.shortcuts import render
from django.contrib.auth.models import User
# Create your views here.


def index(request):
    return render(request, 'registration/index.html', {'hello': 'hello'})


def profile(request):
    username = request.user.username
    return render(request, 'registration/profile.html', {'username': username})


def test_war(request):
    return render(request, 'test_war.html', {})

