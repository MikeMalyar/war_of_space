from django.db import models
from django.contrib.auth.models import User


class Ship(models.Model):
    image = models.ImageField(upload_to="static/images/")
    speed = models.IntegerField(default=1)
    angle = models.IntegerField(default=1)
    isgameship = models.BooleanField(default=False)


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ships = models.ManyToManyField(Ship)

    def __str__(self):
        return self.user.username


class GameShip(Ship):
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)


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


