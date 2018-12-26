from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import index, profile, games, game, join, add, start, play

urlpatterns = [
    path('', index, name='index'),
    path('profile/', profile, name='profile'),
    path('games/', games, name='games'),
    path('games/<int:game_id>/', game, name='game'),
    path('games/<int:game_id>/join', join, name='join'),
    path('games/<int:game_id>/start', start, name='start'),
    path('addgame/', add, name='add'),
    path('play/<int:game_id>', play, name='play'),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)