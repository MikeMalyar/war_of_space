from django.contrib import admin

from .models import Player, Game, Ship, GameShip

admin.site.register(Player)
admin.site.register(Game)
admin.site.register(Ship)
admin.site.register(GameShip)
