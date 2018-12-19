from django.urls import path, include
from .views import index, profile, test_war

urlpatterns = [
    path('', index, name='index'),
    path('profile/', profile, name='profile'),
    path('test_war/', test_war, name='test_war'),
]