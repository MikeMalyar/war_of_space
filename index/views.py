from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse

from .models import Player, Game, GameShip, Ship, Map, MyImage, Weapon, Shell, GameShell, StaticObject, GameStaticObject, GameMoveableObject


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
        quantity = request.POST.get('quantity')
        player = Player.objects.get(user=request.user)
        map_id = request.POST.get('map')
        this_map = Map.objects.get(id=map_id)

        Game.objects.create(title=name, quantity=quantity, map=this_map)

        this_game = Game.objects.last()

        this_game.players.add(player)

        return HttpResponseRedirect(reverse('games', args=()))
    else:
        return render(request, 'game/addgame.html', {'maps': Map.objects.all()})


def start(request, game_id):
    this_game = Game.objects.get(id=game_id)

    if not this_game.started:
        for player in this_game.players.get_queryset():
            ship = player.ships.get_queryset().first()

            gameship = GameShip.objects.create(image=ship.image, rotate=ship.rotate, racing=ship.racing, braking=ship.braking, maxhp=ship.maxhp, hp=ship.maxhp, isgameship=True)
            weapons = list(ship.def_weapons.all())
            gameship.weapons.add(*weapons)
            this_game.ships.add(gameship)

        import random

        small_objects = StaticObject.objects.filter(size=1).filter(isgameobject=False)

        for i in range(1, this_game.map.small_objects + 1, 1):
            j = 0
            for obj in small_objects.all():
                if i % small_objects.count() == j:
                    if random.randint(0, 100) <= 99 - this_game.map.move_percent:  # == 0
                        gameobj = GameStaticObject.objects.create(image=obj.image, title=obj.title, size=obj.size,
                                                              isgameobject=True)
                        gameobj.x = random.randint(-this_game.map.width / 2, this_game.map.width / 2)
                        gameobj.y = random.randint(-this_game.map.height / 2, this_game.map.height / 2)
                        gameobj.save()

                        this_game.static_objects.add(gameobj)
                    else:
                        gameobj = GameMoveableObject.objects.create(image=obj.image, title=obj.title, size=obj.size,
                                                                  isgameobject=True)
                        gameobj.x = random.randint(-this_game.map.width / 2, this_game.map.width / 2)
                        gameobj.y = random.randint(-this_game.map.height / 2, this_game.map.height / 2)
                        gameobj.angle = random.randint(0, 360)
                        gameobj.rotate = random.randint(0, 10) / gameobj.size
                        gameobj.cx = random.randint(-this_game.map.width / 2, this_game.map.width / 2)
                        gameobj.cy = random.randint(-this_game.map.height / 2, this_game.map.height / 2)
                        gameobj.orbit_rotate = random.randint(0, 3) / gameobj.size
                        gameobj.save()

                        this_game.moveable_objects.add(gameobj)

                j += 1

        medium_objects = StaticObject.objects.filter(size=2).filter(isgameobject=False)

        for i in range(1, this_game.map.medium_objects + 1, 1):
            j = 0
            for obj in medium_objects.all():
                if i % medium_objects.count() == j:

                    gameobj = GameStaticObject.objects.create(image=obj.image, title=obj.title, size=obj.size, isgameobject=True)
                    gameobj.x = random.randint(-this_game.map.width / 2, this_game.map.width / 2)
                    gameobj.y = random.randint(-this_game.map.height / 2, this_game.map.height / 2)
                    gameobj.save()

                    this_game.static_objects.add(gameobj)

                j += 1

        large_objects = StaticObject.objects.filter(size=3).filter(isgameobject=False)

        for i in range(1, this_game.map.large_objects + 1, 1):
            j = 0
            for obj in large_objects.all():
                if i % large_objects.count() == j:
                    gameobj = GameStaticObject.objects.create(image=obj.image, title=obj.title, size=obj.size,
                                                              isgameobject=True)
                    gameobj.x = random.randint(-this_game.map.width / 2, this_game.map.width / 2)
                    gameobj.y = random.randint(-this_game.map.height / 2, this_game.map.height / 2)
                    gameobj.save()

                    this_game.static_objects.add(gameobj)

                j += 1

        this_game.started = True
        this_game.save()

    return HttpResponseRedirect(reverse('play', args=(game_id,)))


def finish(request, game_id):
    this_game = Game.objects.get(id=game_id)

    if this_game.started and not this_game.finished:
        for gameship in this_game.ships.get_queryset():
            gameship.delete()

        for gameshell in this_game.shells.get_queryset():
            gameshell.delete()

        for obj in this_game.static_objects.get_queryset():
            obj.delete()

        for obj in this_game.moveable_objects.get_queryset():
            obj.delete()

        this_game.finished = True
        this_game.save()

    return HttpResponseRedirect(reverse('games'))


def play(request, game_id):
    this_game = Game.objects.get(id=game_id)
    player = this_game.players.get(user=request.user)
    this_index = 0
    for p in this_game.players.get_queryset():
        if p.id == player.id:
            break
        this_index += 1
    current = MyImage.objects.get(title="Current").image

    return render(request, 'play/play.html', {'game': this_game, 'player': player, 'index': this_index, 'current': current})


def change(request):
    ship_id = request.GET.get("ship_id", None)
    game_id = request.GET.get("game_id", None)
    this_game = Game.objects.get(id=game_id)
    ship = this_game.ships.get(id=ship_id)

    speed = request.GET.get("speed", None)
    angle = request.GET.get("angle", None)
    rotate = request.GET.get("rotate", None)
    racing = request.GET.get("racing", None)
    x = request.GET.get("x", None)
    y = request.GET.get("y", None)
    hp = request.GET.get("hp", None)

    ship.speed = speed
    ship.angle = angle
    ship.rotate = rotate
    ship.racing = racing
    ship.x = x
    ship.y = y
    ship.hp = hp

    ship.save()

    data = {

    }
    return JsonResponse(data)


def shoot(request):
    game_id = request.GET.get("game_id", None)
    weapon_id = request.GET.get("weapon_id", None)
    this_game = Game.objects.get(id=game_id)
    weapon = Weapon.objects.get(id=weapon_id)

    shell = weapon.shell

    angle = request.GET.get("angle", None)
    x = request.GET.get("x", None)
    y = request.GET.get("y", None)
    ship_id = request.GET.get("ship_id", None)

    gameshell = GameShell.objects.create(image=shell.image, speed=shell.speed, angle=angle, x=x, y=y, ship_id=ship_id, lifetime=shell.lifetime)

    this_game.shells.add(gameshell)

    data = {
        'id': gameshell.id,
        'image': gameshell.image.url,
        'speed': gameshell.speed,
        'angle': gameshell.angle,
        'x': gameshell.x,
        'y': gameshell.y,
        'ship_id': gameshell.ship_id,
        'lifetime': gameshell.lifetime,
        'time': gameshell.time,
    }

    return JsonResponse(data)


def change_shell(request):
    shell_id = request.GET.get("shell_id", None)
    game_id = request.GET.get("game_id", None)
    this_game = Game.objects.get(id=game_id)

    if this_game.shells.filter(id=shell_id).exists():

        shell = this_game.shells.get(id=shell_id)

        speed = request.GET.get("speed", None)
        angle = request.GET.get("angle", None)
        x = request.GET.get("x", None)
        y = request.GET.get("y", None)
        lifetime = request.GET.get("lifetime", None)
        time = request.GET.get("time", None)

        shell.speed = speed
        shell.angle = angle
        shell.x = x
        shell.y = y
        shell.lifetime = lifetime
        shell.time = time

        shell.save()

    data = {

    }
    return JsonResponse(data)


def drop_shell(request):
    shell_id = request.GET.get("shell_id", None)
    game_id = request.GET.get("game_id", None)
    this_game = Game.objects.get(id=game_id)

    if GameShell.objects.filter(id=shell_id).exists():
        shell = GameShell.objects.get(id=shell_id)

        this_game.shells.remove(shell)
        shell.delete()

    data = {

    }
    return JsonResponse(data)


def change_obj(request):
    obj_id = request.GET.get("obj_id", None)
    game_id = request.GET.get("game_id", None)
    this_game = Game.objects.get(id=game_id)
    obj = this_game.moveable_objects.get(id=obj_id)

    angle = request.GET.get("angle", None)
    rotate = request.GET.get("rotate", None)
    x = request.GET.get("x", None)
    y = request.GET.get("y", None)
    cx = request.GET.get("cx", None)
    cy = request.GET.get("cy", None)
    orbit_rotate = request.GET.get("orbit_rotate", None)

    obj.orbit_rotate = orbit_rotate
    obj.angle = angle
    obj.rotate = rotate
    obj.x = x
    obj.y = y
    obj.cx = cx
    obj.cy = cy

    obj.save()

    data = {

    }
    return JsonResponse(data)
