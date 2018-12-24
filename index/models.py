from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username


class Game(models.Model):
    players = models.ManyToManyField(Player)
    title = models.CharField(max_length=40, default="The game")
    quantity = models.IntegerField(default=4)
    started = models.BooleanField(default=False)

    def __str__(self):
        size = self.players.get_queryset().count()
        str1 = " Players " + size.__str__() + "/" + self.quantity.__str__()
        return '"' + self.title + '"' + " Creator " + self.players.first().__str__() + str1

