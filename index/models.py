from django.db import models
from django.contrib.auth.models import User


class Map(models.Model):
    image = models.ImageField(null=True)
    title = models.CharField(max_length=40, default="The map")
    small_objects = models.IntegerField(default=0)
    medium_objects = models.IntegerField(default=0)
    large_objects = models.IntegerField(default=0)
    move_percent = models.IntegerField(default=10)
    width = models.IntegerField(default=1000)
    height = models.IntegerField(default=500)

    def __str__(self):
        return self.title


class Shell(models.Model):
    image = models.ImageField(null=True)
    speed = models.FloatField(default=1)        #Speed in pixels per second
    lifetime = models.IntegerField(default=5)       #Lifetime in seconds
    isgameshell = models.BooleanField(default=False)


class GameShell(Shell):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    angle = models.FloatField(default=0)
    ship_id = models.IntegerField(default=0)
    time = models.FloatField(default=0)


class Weapon(models.Model):
    image = models.ImageField(null=True)
    title = models.CharField(max_length=40, default="The weapon")
    shell = models.ForeignKey(Shell, on_delete=models.CASCADE, null=True)
    cost = models.IntegerField(default=1000)


class StaticObject(models.Model):
    image = models.ImageField(null=True)
    size = models.IntegerField(default=1)
    title = models.CharField(max_length=40, default="The object")
    isgameobject = models.BooleanField(default=False)
    issolid = models.BooleanField(default=True)
    money_plus = models.IntegerField(default=0)
    hp_plus = models.IntegerField(default=0)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class GameStaticObject(StaticObject):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)


class GameMoveableObject(StaticObject):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    rotate = models.FloatField(default=0)
    angle = models.FloatField(default=0)
    cx = models.FloatField(default=0)
    cy = models.FloatField(default=0)
    orbit_rotate = models.FloatField(default=0)


class Ship(models.Model):
    image = models.ImageField(null=True)
    title = models.CharField(max_length=40, default="The ship")
    racing = models.FloatField(default=1)       #Racing in pixels per second
    braking = models.FloatField(default=1)      #Braking in pixels per second
    rotate = models.FloatField(default=1)       #Rotation in degrees per second
    isgameship = models.BooleanField(default=False)
    def_weapons = models.ManyToManyField(Weapon)
    maxhp = models.IntegerField(default=100)
    cost = models.IntegerField(default=1000)
    isdefault = models.BooleanField(default=True)


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ships = models.ManyToManyField(Ship)
    ship_id = models.IntegerField(default=0)
    money = models.IntegerField(default=5000)

    def __str__(self):
        return self.user.username


class GameShip(Ship):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    angle = models.FloatField(default=0)
    speed = models.FloatField(default=0)    #Speed in pixels per second
    weapons = models.ManyToManyField(Weapon)
    hp = models.FloatField(default=100)
    money = models.IntegerField(default=0)


class Game(models.Model):
    map = models.ForeignKey(Map, on_delete=models.CASCADE, null=True)
    players = models.ManyToManyField(Player)
    title = models.CharField(max_length=40, default="The game")
    quantity = models.IntegerField(default=4)
    started = models.BooleanField(default=False)
    finished = models.BooleanField(default=False)

    ships = models.ManyToManyField(GameShip)
    shells = models.ManyToManyField(GameShell)
    static_objects = models.ManyToManyField(GameStaticObject)
    moveable_objects = models.ManyToManyField(GameMoveableObject)

    def __str__(self):
        size = self.players.get_queryset().count()
        t = "None"
        if self.map is not None:
            t = '"' + self.map.title + '"'
        str1 = " Map " + t + " Players " + size.__str__() + "/" + self.quantity.__str__()
        return '"' + self.title + '"' + " Creator " + self.players.first().__str__() + str1


class MyImage(models.Model):
    title = models.CharField(max_length=40)
    image = models.ImageField(null=True)


