from django.shortcuts import render

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
    your_game = Game.objects.get(id=game_id)
    return render(request, 'game/game.html', {'game': your_game})


def test_war(request):
    return render(request, 'test_war.html', {})

