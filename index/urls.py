from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('profile/', profile, name='profile'),
    path('games/', games, name='games'),
    path('shop/', shop, name='shop'),
    path('games/<int:game_id>/', game, name='game'),
    path('games/<int:game_id>/join', join, name='join'),
    path('games/<int:game_id>/start', start, name='start'),
    path('games/<int:game_id>/finish', finish, name='finish'),
    path('addgame/', add, name='add'),
    path('play/<int:game_id>', play, name='play'),
    url(r'^ajax/change/$', change, name='change'),
    url(r'^ajax/changeShell/$', change_shell, name='change_shell'),
    url(r'^ajax/dropShell/$', drop_shell, name='drop_shell'),
    url(r'^ajax/shoot/$', shoot, name='shoot'),
    url(r'^ajax/changeObj/$', change_obj, name='change_obj'),
    url(r'^ajax/changeStaticObj/$', change_static_obj, name='change_static_obj'),
    url(r'^ajax/chooseShip/$', choose_ship, name='choose_ship'),
    url(r'^ajax/buyShip/$', buy_ship, name='buy_ship'),
    url(r'^ajax/buyWeapon/$', buy_weapon, name='buy_weapon'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
