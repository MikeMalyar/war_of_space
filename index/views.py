from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse

from .models import Player, Game, GameShip, Ship


def index(request):
    return render(request, 'index.html', {})


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
    for player in this_game.players.get_queryset():

        ship = player.ships.get_queryset().first()

        gameship = GameShip.objects.create(image=ship.image, rotate=ship.rotate, racing=ship.racing, isgameship=True)
        this_game.ships.add(gameship)

    this_game.save()
    return HttpResponseRedirect(reverse('play', args=(game_id,)))


def play(request, game_id):
    this_game = Game.objects.get(id=game_id)
    player = this_game.players.get(user=request.user)
    this_index = 0
    for p in this_game.players.get_queryset():
        if p.id == player.id:
            break
        this_index += 1

    return render(request, 'play/play.html', {'game': this_game, 'player': player, 'index': this_index})


def change(request):
    ship_id = request.GET.get("ship_id", None)
    game_id = request.GET.get("game_id", None)
    this_game = Game.objects.get(id=game_id)
    ship = this_game.ships.get(id=ship_id)

    flag = False
    if ship is not None:
        flag = True

    speed = request.GET.get("speed", None)
    angle = request.GET.get("angle", None)
    rotate = request.GET.get("rotate", None)
    racing = request.GET.get("racing", None)
    x = request.GET.get("x", None)
    y = request.GET.get("y", None)

    ship.speed = speed
    ship.angle = angle
    ship.rotate = rotate
    ship.racing = racing
    ship.x = x
    ship.y = y

    ship.save()

    data = {
        'flag': flag,

    }
    return JsonResponse(data)

