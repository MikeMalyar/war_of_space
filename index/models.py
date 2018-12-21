from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username


class Game(models.Model):
    players = models.ManyToManyField(Player)
    title = models.CharField(max_length=40, default="The game")

    def __str__(self):
        return '"' + self.title + '"' + " Creator " + self.players.first().__str__()

