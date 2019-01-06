from django.contrib import admin

from .models import Player, Game, Ship, GameShip, Map, Weapon, Shell

admin.site.register(Player)
admin.site.register(Game)
admin.site.register(Ship)
admin.site.register(GameShip)
admin.site.register(Map)
admin.site.register(Shell)
admin.site.register(Weapon)
