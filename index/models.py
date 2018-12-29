from django.db import models
from django.contrib.auth.models import User


class Ship(models.Model):
    image = models.ImageField(null=True)
    racing = models.FloatField(default=1)       #Racing in pixels per second
    rotate = models.FloatField(default=1)       #Rotation in degrees per second
    isgameship = models.BooleanField(default=False)


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ships = models.ManyToManyField(Ship)

    def __str__(self):
        return self.user.username


class GameShip(Ship):
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    angle = models.FloatField(default=0)
    speed = models.FloatField(default=0)    #Speed in pixels per second


class Game(models.Model):
    players = models.ManyToManyField(Player)
    title = models.CharField(max_length=40, default="The game")
    quantity = models.IntegerField(default=4)
    started = models.BooleanField(default=False)
    ships = models.ManyToManyField(GameShip)

    def __str__(self):
        size = self.players.get_queryset().count()
        str1 = " Players " + size.__str__() + "/" + self.quantity.__str__()
        return '"' + self.title + '"' + " Creator " + self.players.first().__str__() + str1


