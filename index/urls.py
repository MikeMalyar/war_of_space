from django.urls import path, include
from .views import index, profile, test_war, games, game

urlpatterns = [
    path('', index, name='index'),
    path('profile/', profile, name='profile'),
    path('games/', games, name='games'),
    path('games/<int:game_id>/', game, name='game'),
    path('test_war/', test_war, name='test_war'),
]