from django.contrib import admin

from .models import Player, Game, Ship, GameShip, Map, Weapon, Shell, GameShell, MyImage, StaticObject, GameStaticObject

admin.site.register(Player)
admin.site.register(Game)
admin.site.register(Ship)
admin.site.register(GameShip)
admin.site.register(Map)
admin.site.register(Shell)
admin.site.register(Weapon)
admin.site.register(MyImage)
admin.site.register(GameShell)
admin.site.register(StaticObject)
admin.site.register(GameStaticObject)

