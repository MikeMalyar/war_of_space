from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import Player, Game


def index(request):
    return render(request, 'index.html', {'hello': 'hello'})


def profile(request):
    username = request.user.username
    if username != "":
        player = Player.objects.get(user=request.user)
        return render(request, 'registration/profile.html', {'username': username, 'player': player})
    else:
        return render(request, 'index.html')


def games(request):
    game_list = Game.objects.all()
    return render(request, 'game/games.html', {'games': game_list})


def game(request, game_id):
    player = Player.objects.get(user=request.user)
    your_game = Game.objects.get(id=game_id)
    return render(request, 'game/game.html', {'game': your_game, 'player': player})


def join(request, game_id):
    player = Player.objects.get(user=request.user)
    this_game = Game.objects.get(id=game_id)

    this_game.players.add(player)

    return HttpResponseRedirect(reverse('game', args=(game_id,)))


def add(request):
    if request.POST:
        name = request.POST.get('name')
        player = Player.objects.get(user=request.user)

        Game.objects.create(title=name)

        this_game = Game.objects.last()

        this_game.players.add(player)

        return HttpResponseRedirect(reverse('games', args=()))
    else:
        return render(request, 'game/addgame.html')


def start(request, game_id):
    this_game = Game.objects.get(id=game_id)

    this_game.started = True
    this_game.save()
    return HttpResponseRedirect(reverse('play', args=(game_id,)))


def play(request, game_id):
    return render(request, 'test_war.html', {})


