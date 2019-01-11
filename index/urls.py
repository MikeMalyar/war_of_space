from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url
from .views import index, profile, games, game, join, add, start, play, change, shoot, change_shell, drop_shell

urlpatterns = [
    path('', index, name='index'),
    path('profile/', profile, name='profile'),
    path('games/', games, name='games'),
    path('games/<int:game_id>/', game, name='game'),
    path('games/<int:game_id>/join', join, name='join'),
    path('games/<int:game_id>/start', start, name='start'),
    path('addgame/', add, name='add'),
    path('play/<int:game_id>', play, name='play'),
    url(r'^ajax/change/$', change, name='change'),
    url(r'^ajax/changeShell/$', change_shell, name='change_shell'),
    url(r'^ajax/dropShell/$', drop_shell, name='drop_shell'),
    url(r'^ajax/shoot/$', shoot, name='shoot'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
