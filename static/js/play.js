let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let interval = 100;

var ships = [];
var shells = [];
var static_objects = [];
var moveable_objects = [];
var weapons = [];
var images = null;
var map = null;
var player = 0;
var time = 0;
var game_id = 0;
var max_frags = 0;
var curr_weap = 0;

var flag = true;

var socket = null;

function StaticObject(id, image, title, x, y, solid, money, hp, visible, weapon_id)
{
    this.id = id;
    this.image = image;
    this.title = title;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.solid = solid;
    this.money = money;
    this.hp = hp;
    this.visible = visible;
    this.weapon_id = weapon_id;
}

function MoveableObject(id, image, title, x, y, angle, rotate, cx, cy, orbit_rotate, solid, money, hp, visible, weapon_id)
{
    this.id = id;
    this.image = image;
    this.title = title;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.rotate = rotate;
    this.cx = cx;
    this.cy = cy;
    this.orbit_rotate = orbit_rotate;
    this.solid = solid;
    this.money = money;
    this.hp = hp;
    this.visible = visible;
    this.weapon_id = weapon_id;

    this.orbit = function () {
        var x1 = (this.x - this.cx) * Math.cos(this.orbit_rotate / 180 * Math.PI) - (this.y - this.cy) * Math.sin(this.orbit_rotate / 180 * Math.PI) + this.cx;
        var y1 = (this.x - this.cx) * Math.sin(this.orbit_rotate / 180 * Math.PI) + (this.y - this.cy) * Math.cos(this.orbit_rotate / 180 * Math.PI) + this.cy;

        this.x = x1;
        this.y = y1;
    }
}

function Weapon(id, image, title)
{
    this.id = id;
    this.image = image;
    this.title = title;
}

function Shell(id, ship_id, image, speed, x, y, angle, lifetime, time)
{
    this.id = id;
    this.ship_id = ship_id;
    this.image = image;
    this.speed = speed;
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.lifetime = lifetime;
    this.time = time;

    this.move = function()
    {
        var speed = this.speed * interval / 1000.0;
        var dx = speed * Math.sin(this.angle / 180 * Math.PI);
        var dy = speed * Math.cos(this.angle / 180 * Math.PI);

        this.x += dx;
        this.y -= dy;
    }
}

function Ship(id, image, racing, braking, speed, rotate, angle, x, y, hp, maxhp, money, frags, visible, weapons)
{
    this.id = id;
    this.image = image;
    this.speed = speed;
    this.angle = angle;
    this.rotate = rotate;
    this.racing = racing;
    this.braking = braking;
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxhp = maxhp;
    this.weapons = weapons;
    this.money = money;
    this.frags = frags;
    this.visible = visible;

    this.move = function()
    {
        var speed = this.speed * interval / 1000.0;
        var dx = speed * Math.sin(this.angle / 180 * Math.PI);
        var dy = speed * Math.cos(this.angle / 180 * Math.PI);

        this.x += dx;
        this.y -= dy;

        if(this.x > map.image.width / 2)
            this.x = -map.image.width / 2;
        if(this.y > map.image.height / 2)
            this.y = -map.image.height / 2;
        if(this.x < -map.image.width / 2)
           this.x = map.image.width / 2;
        if(this.y < -map.image.height / 2)
           this.y = map.image.height / 2;
    }
}

function Map(image)
{
    this.image = image;
}

function init(m, ships_list, shells_list, static_list, moveable_list, weapons_list, index, game, frags, images_ob)
{
    map = m;
    ships = ships_list;
    shells = shells_list;
    static_objects = static_list;
    moveable_objects = moveable_list;
    weapons = weapons_list;
    player = index;
    game_id = game;
    max_frags = frags;
    images = images_ob;

    ships.sort(function(a, b){
       return(a.id - b.id);
    });

    socket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/play/' + game_id + '/');

    socket.onmessage = function(e)
    {
        var data = JSON.parse(e.data);

        if(data['obj'] === 'ship')
        {
            var ship_id = data['ship_id'];

            for (var i = 0; i < ships.length; ++i)
            {
                if (ships[i].id === ship_id && i !== player)
                {
                    if(data['speed'] !== 'null') {
                        ships[i].speed = data['speed'];
                        ships[i].angle = data['angle'];
                        ships[i].racing = data['racing'];
                        ships[i].rotate = data['rotate'];
                        ships[i].x = data['x'];
                        ships[i].y = data['y'];
                        ships[i].money = data['money'];
                    }

                    if(data['hp'] !== 'null') {
                        ships[i].hp = data['hp'];
                        ships[i].frags = data['frags'];

                        ships[i].visible = false;
                        if (data['visible'] === 1)
                            ships[i].visible = true;
                    }

                    draw();

                    break;
                }
            }
        }
        if(data['obj'] === 'shell')
        {
            var shell_id = data['shell_id'];

            var flag = true;
            for (i = 0; i < shells.length; ++i)
            {
                var flag1 = true;
                for(var j = 0; j < ships.length; ++j) {
                    if(ships[j].id === shells[i].ship_id) {
                        if(j === player) {
                            flag1 = false;
                            break;
                        }
                        break;
                    }
                }
                if (shells[i].id === shell_id && flag1)
                {
                    shells[i].ship_id = data['ship_id'];
                    shells[i].speed = data['speed'];
                    shells[i].angle = data['angle'];
                    shells[i].x = data['x'];
                    shells[i].y = data['y'];
                    shells[i].lifetime = data['lifetime'];
                    shells[i].time = data['time'];

                    if(data['destroyed'])
                    {
                        shells.splice(i, 1);
                    }

                    draw();

                    flag = false;
                    break;
                }
            }
            for(i = 0; i < ships.length; ++i)
            {
                if(data['ship_id'] === ships[i].id && i === player)
                {
                    flag = false;
                    break;
                }
            }
            if(flag)
            {
                var image = document.createElement("IMG");
                image.src = data['image'];
                image.onload=function(){
                };

                shells.push(new Shell(shell_id, data['ship_id'], image, data['speed'], data['x'], data['y'], data['angle'], data['lifetime'], data['time']));

                draw();
            }
        }
        if(data['obj'] === 'move_obj')
        {
            var obj_id = data['obj_id'];

            for (i = 0; i < moveable_objects.length; ++i)
            {
                if (i % ships.length !== player && moveable_objects[i].id === obj_id)
                {
                    moveable_objects[i].orbit_rotate = data['orbit_rotate'];
                    moveable_objects[i].angle = data['angle'];
                    moveable_objects[i].rotate = data['rotate'];
                    moveable_objects[i].x = data['x'];
                    moveable_objects[i].y = data['y'];
                    moveable_objects[i].cx = data['cx'];
                    moveable_objects[i].cy = data['cy'];
                    moveable_objects[i].visible = false;
                    if(data['visible'] === 1)
                        moveable_objects[i].visible = true;

                    draw();

                    break;
                }
            }
        }
        if(data['obj'] === 'static_obj')
        {
            obj_id = data['obj_id'];

            for (i = 0; i < static_objects.length; ++i)
            {
                if (static_objects[i].id === obj_id)
                {
                    static_objects[i].x = data['x'];
                    static_objects[i].y = data['y'];
                    static_objects[i].visible = false;
                    if(data['visible'] === 1)
                        static_objects[i].visible = true;

                    draw();

                    break;
                }
            }
        }
    };

    socket.onclose = function(e)
    {
        console.error("web socked closed unexpectedly");
    };

    setTimeout(function run()
    {
        if (flag)
        {
            time += interval;
            for(var i = 0; i < shells.length; ++i)
            {
                if(shells[i].ship_id === ships[player].id)
                {
                    shells[i].move();
                    shells[i].time += interval / 1000.0;
                    changeShell(i, false);

                    for(j = 0; j < ships.length; ++j)
                    {
                        if(j !== player && ships[j].visible === true)
                        {
                            if(checkCollision(ships[j], shells[i]))
                            {
                                ships[j].hp = ships[j].hp - 50;
                                console.log('HP ' + ships[j].hp);
                                if(ships[j].hp <= 0)
                                {
                                    ships[player].frags += 1;
                                    ships[j].visible = false;
                                }

                                change(j, 'hp');

                                shells[i].time += shells[i].lifetime;
                            }
                        }
                    }

                    for(j = 0; j < static_objects.length; ++j)
                    {
                        if(static_objects[j].visible === true && static_objects[j].solid === true)
                        {
                            if(checkCollision(static_objects[j], shells[i]))
                            {
                                shells[i].time += shells[i].lifetime;
                            }
                        }
                    }

                    for(j = 0; j < moveable_objects.length; ++j)
                    {
                        if(moveable_objects[j].visible === true && moveable_objects[j].solid === true)
                        {
                            if(checkCollision(moveable_objects[j], shells[i]))
                            {
                                shells[i].time += shells[i].lifetime;
                            }
                        }
                    }

                    if(shells[i].time > shells[i].lifetime)
                    {
                        dropShell(i);
                        shells.splice(i, 1);
                    }
                }
            }

            if(ships[player].visible === true)
                ships[player].move();

            for(i = 0; i < ships.length; ++i)
            {
                if(i !== player && ships[player].visible === true && ships[i].visible === true)
                {
                    if(checkCollision(ships[i], ships[player]))
                    {
                        ships[i].hp = 0;
                        ships[i].visible = false;
                        change(i, 'hp');
                        ships[player].hp = 0;
                    }
                }

                if(ships[i].frags >= max_frags)
                {
                   flag = false;
                   window.location.href = "/games/" + game_id + "/finish";
                }
            }
            for(i = 0; i < static_objects.length; ++i)
            {
                if(checkCollision(ships[player], static_objects[i]))
                {
                    if(static_objects[i].visible === true && ships[player].visible === true)
                    if(static_objects[i].solid === true)
                    {
                        ships[player].hp = 0;
                        ships[player].frags -= 1;

                        change(player, 'hp');
                    }
                    else
                    {
                        ships[player].money += static_objects[i].money;
                        ships[player].hp += static_objects[i].hp;

                        if(static_objects[i].weapon_id !== null)
                        {
                            for(var j = 0;j < weapons.length; ++j)
                            {
                                if(weapons[j].id === static_objects[i].weapon_id)
                                {
                                    var flag1 = true;
                                    for(var k = 0; k < ships[player].weapons.length; ++k)
                                    {
                                        if(ships[player].weapons[k].id === weapons[j].id)
                                        {
                                            flag1 = false;
                                            break;
                                        }
                                    }
                                    if(flag1)
                                    {
                                        ships[player].weapons.push(weapons[j]);

                                    }
                                    break;
                                }
                            }
                        }

                        static_objects[i].visible = false;
                        changeStaticObj(i);
                    }
                }
            }
            for(i = 0; i < moveable_objects.length; ++i)
            {
                if(checkCollision(ships[player], moveable_objects[i]))
                {
                    if(moveable_objects[i].visible === true && ships[player].visible === true)
                    if(moveable_objects[i].solid === true)
                    {
                        ships[player].hp = 0;
                        ships[player].frags -= 1;
                    }
                    else
                    {
                        ships[player].money += moveable_objects[i].money;
                        ships[player].hp += moveable_objects[i].hp;

                        moveable_objects[i].visible = false;
                        changeObj(i);
                    }
                }
            }

            if(ships[player].hp <= 0)
            {
                ships[player].visible = false;
            }

            change(player, 'move');

            for(i = 0; i < moveable_objects.length; ++i)
            {
                if(i % ships.length === player)
                {
                    moveable_objects[i].angle += moveable_objects[i].rotate;
                    moveable_objects[i].orbit();
                    changeObj(i);
                }
            }

            draw();
            setTimeout(run, interval);
        }
    }, interval);

    /*var timer_id = setInterval(function run()
    {
        if (flag)
        {
            ships[player].move();
            console.log(ships[player]);
            change(player);
            draw();
            setTimeout(run, interval);
        }
        else
        {
            clearInterval(timer_id);
        }
    }, interval);*/

    draw();
}

function drawRotatedImage(image, angle, x, y)
{
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle / 180 * Math.PI);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();
}

function draw()
{
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawRotatedImage(map.image, 0, canvas.width / 2 - ships[player].x, canvas.height / 2 - ships[player].y);

    for(var i = 0; i < ships.length; ++i)
    {
        if(i !== player)
        {
            if (ships[i].visible === true)
            {
                var x = canvas.width / 2 - (ships[player].x - ships[i].x);
                var y = canvas.height / 2 - (ships[player].y - ships[i].y);

                if (x + ships[i].image.width >= 0 && x - ships[i].image.width <= canvas.width
                    && y + ships[i].image.height >= 0 && y - ships[i].image.height <= canvas.height)
                {
                    drawRotatedImage(ships[i].image, ships[i].angle, x, y);
                }
            }
        }
        else
        {
            if(ships[i].visible === true)
            {
                drawRotatedImage(ships[i].image, ships[i].angle, canvas.width / 2, canvas.height / 2);
            }
        }
    }

    for(i = 0; i < shells.length; ++i)
    {
        x = canvas.width / 2 - (ships[player].x - shells[i].x);
        y = canvas.height / 2 - (ships[player].y - shells[i].y);

        if(x + shells[i].image.width >= 0 && x - shells[i].image.width <= canvas.width
            && y + shells[i].image.height >= 0 && y - shells[i].image.height <= canvas.height)
        {
            drawRotatedImage(shells[i].image, shells[i].angle, x, y);
        }
    }

    for(i = 0; i < static_objects.length; ++i)
    {
        if(static_objects[i].visible)
        {
            x = canvas.width / 2 - (ships[player].x - static_objects[i].x);
            y = canvas.height / 2 - (ships[player].y - static_objects[i].y);

            if (x + static_objects[i].image.width >= 0 && x - static_objects[i].image.width <= canvas.width
                && y + static_objects[i].image.height >= 0 && y - static_objects[i].image.height <= canvas.height)
            {
                drawRotatedImage(static_objects[i].image, 0, x, y);
            }
        }
    }

    for(i = 0; i < moveable_objects.length; ++i)
    {
        if(moveable_objects[i].visible)
        {
            x = canvas.width / 2 - (ships[player].x - moveable_objects[i].x);
            y = canvas.height / 2 - (ships[player].y - moveable_objects[i].y);

            if (x + moveable_objects[i].image.width >= 0 && x - moveable_objects[i].image.width <= canvas.width
                && y + moveable_objects[i].image.height >= 0 && y - moveable_objects[i].image.height <= canvas.height)
            {
                drawRotatedImage(moveable_objects[i].image, moveable_objects[i].angle, x, y);
            }
        }
    }

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 50px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("" + parseInt(String(ships[player].speed)), canvas.width, canvas.height - 100);

    ctx.fillStyle = "#008800";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("" + parseInt(String(ships[player].hp)) + "/" + parseInt(String(ships[player].maxhp)), canvas.width, canvas.height - 50);

    ctx.fillStyle = "#fff000";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Money: " + parseInt(String(ships[player].money)), 0, 20);

    ctx.fillStyle = "#ff00c0";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Frags: " + parseInt(String(ships[player].frags)), canvas.width, 20);
    ctx.fillText("Max frags: " + parseInt(String(max_frags)), canvas.width, 50);

    var max = ships[0].frags;

    for(i = 1; i < ships.length; ++i)
    {
        if(ships[i].frags > max)
        {
            max = ships[i].frags;
        }
    }

    ctx.fillText("Leader: " + parseInt(String(max)), canvas.width, 80);

    if(ships[player].visible === false)
    {
        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Press <R> to respawn", 0,  canvas.height - 100);
    }

    for(i = 0; i < ships[player].weapons.length; ++i)
    {
        var image = ships[player].weapons[i].image;
        ctx.drawImage(image, i * image.width * 3 / 2, canvas.height - image.height * 3 / 2);

        if(i === curr_weap)
        {
            ctx.drawImage(images.current, i * image.width * 3 / 2, canvas.height - image.height * 3 / 2);
        }
    }
}

document.addEventListener('keydown',
    function (event) {
        //console.log(event.keyCode);
        switch (event.keyCode) {
            case 87:
                ships[player].speed += ships[player].racing * interval / 1000.0;
                // change(player);
                break;
            case 68:
                ships[player].angle += ships[player].rotate * interval / 1000.0;
                // change(player);
                break;
            case 83:
                ships[player].speed -= ships[player].braking * interval / 1000.0;
                // change(player);
                break;
            case 65:
                ships[player].angle -= ships[player].rotate * interval / 1000.0;
                // change(player);
                break;
            case 8:
                flag = false;
                break;
            case 81:
                changeWeapon(1);
                break;
            case 69:
                changeWeapon(-1);
                break;
            case 32:
                if(time > 1000) {
                    shoot();
                    time = 0;
                }

                break;
            case 82:
                if(ships[player].visible === false)
                {
                    ships[player].hp = ships[player].maxhp;
                    ships[player].x = getRandomInt(-canvas.width / 2, canvas.width / 2 + 1);
                    ships[player].y = getRandomInt(-canvas.height / 2, canvas.height / 2 + 1);
                    ships[player].angle = getRandomInt(0, 360);
                    ships[player].speed = 0;
                    ships[player].visible = true;
                    change(player, 'hp');
                }
                break;
        }

        draw();
    }
);

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min)) + min;
}

function onWheel(e)
{
    e = e || window.event;

    // wheelDelta не дает возможность узнать количество пикселей
    var delta = e.deltaY || e.detail || e.wheelDelta;

    changeWeapon(delta);
}

function changeWeapon(delta)
{
    if(delta > 0)
    {
        if(curr_weap > 0)
            --curr_weap;
    }
    if(delta < 0)
    {
        if(curr_weap < ships[player].weapons.length - 1)
            ++curr_weap;
    }

    draw();
}

function change(index, type)
{
    var visible = 0;
    if(ships[index].visible === true)
        visible = 1;

    var value = {};
    if(type === 'move') {
        value = {
            'obj': 'ship',
            'ship_id': ships[index].id,
            'speed': ships[index].speed,
            'angle': ships[index].angle,
            'rotate': ships[index].rotate,
            'racing': ships[index].racing,
            'x': ships[index].x,
            'y': ships[index].y,
            'hp': 'null',
            'money': ships[index].money,
            'frags': 'null',
            'visible': 'null',
        }
    }
    if(type === 'hp') {
        value = {
            'obj': 'ship',
            'ship_id': ships[index].id,
            'speed': 'null',
            'angle': 'null',
            'rotate': 'null',
            'racing': 'null',
            'x': 'null',
            'y': 'null',
            'hp': ships[index].hp,
            'money': 'null',
            'frags': ships[index].frags,
            'visible': visible,
        }
    }

    if(socket.readyState !== 0)
    socket.send(JSON.stringify(value));

    // $.ajax({
    //     url: '/ajax/change/',
    //     data: {
    //         'game_id': game_id,
    //         'ship_id': ships[index].id,
    //         'speed': ships[index].speed,
    //         'angle': ships[index].angle,
    //         'rotate': ships[index].rotate,
    //         'racing': ships[index].racing,
    //         'x': ships[index].x,
    //         'y': ships[index].y,
    //         'hp': ships[index].hp,
    //         'money': ships[index].money,
    //         'frags': ships[index].frags,
    //         'visible': visible,
    //     },
    //     dataType: 'json',
    //     success: function (data) {
    //         //console.log(data.flag);
    //     }
    // });
}

function shoot()
{
    $.ajax({
       url: '/ajax/shoot/',
       data: {
           'game_id': game_id,
           'weapon_id': ships[player].weapons[curr_weap].id,
           'x': ships[player].x + 32 * Math.sin(ships[player].angle / 180 * Math.PI),
           'y': ships[player].y - 32 * Math.cos(ships[player].angle / 180 * Math.PI),
           'angle': ships[player].angle,
           'ship_id': ships[player].id,
       },
       dataType: 'json',
       success: function (data) {
           var image = document.createElement("IMG");
           image.src = data.image;

           var shell = new Shell(data.id, parseInt(data.ship_id), image, data.speed, parseFloat(data.x), parseFloat(data.y), parseFloat(data.angle), parseInt(data.lifetime), parseFloat(data.time));
           shells.push(shell);

           changeShell(shells.length - 1, false);
       }
    });
}

function changeShell(index, destroyed)
{
    if(socket.readyState !== 0)
    socket.send(JSON.stringify({
            'obj': 'shell',
            'shell_id': shells[index].id,
            'ship_id': shells[index].ship_id,
            'image': shells[index].image.src,
            'speed': shells[index].speed,
            'angle': shells[index].angle,
            'x': shells[index].x,
            'y': shells[index].y,
            'lifetime': shells[index].lifetime,
            'time': shells[index].time,
            'destroyed': destroyed,
        }));

    // $.ajax({
    //     url: '/ajax/changeShell/',
    //     data: {
    //         'game_id': game_id,
    //         'shell_id': shells[index].id,
    //         'speed': shells[index].speed,
    //         'angle': shells[index].angle,
    //         'x': shells[index].x,
    //         'y': shells[index].y,
    //         'lifetime': shells[index].lifetime,
    //         'time': shells[index].time,
    //     },
    //     dataType: 'json',
    //     success: function (data) {
    //         //console.log(data.flag);
    //     }
    // });
}

function dropShell(index)
{
    changeShell(index, true);

    $.ajax({
        url: '/ajax/dropShell/',
        data: {
            'game_id': game_id,
            'shell_id': shells[index].id,
        },
        dataType: 'json',
        success: function (data) {
            //console.log(data.flag);
        }
    });
}

function changeObj(index)
{
    var visible = 0;
    if(moveable_objects[index].visible === true)
        visible = 1;

    if(socket.readyState !== 0)
    socket.send(JSON.stringify({
            'obj': 'move_obj',
            'obj_id': moveable_objects[index].id,
            'angle': moveable_objects[index].angle,
            'rotate': moveable_objects[index].rotate,
            'x': moveable_objects[index].x,
            'y': moveable_objects[index].y,
            'orbit_rotate': moveable_objects[player].orbit_rotate,
            'cx': moveable_objects[index].cx,
            'cy': moveable_objects[index].cy,
            'visible': visible,
        }));

    // $.ajax({
    //     url: '/ajax/changeObj/',
    //     data: {
    //         'game_id': game_id,
    //         'obj_id': moveable_objects[index].id,
    //         'angle': moveable_objects[index].angle,
    //         'rotate': moveable_objects[index].rotate,
    //         'x': moveable_objects[index].x,
    //         'y': moveable_objects[index].y,
    //         'orbit_rotate': moveable_objects[player].orbit_rotate,
    //         'cx': moveable_objects[index].cx,
    //         'cy': moveable_objects[index].cy,
    //         'visible': visible,
    //     },
    //     dataType: 'json',
    //     success: function (data) {
    //         //console.log(data.flag);
    //     }
    // });
}

function changeStaticObj(index)
{
    var visible = 0;
    if(static_objects[index].visible === true)
        visible = 1;

    if(socket.readyState !== 0)
    socket.send(JSON.stringify({
        'obj': 'static_obj',
        'obj_id': static_objects[index].id,
            'x': static_objects[index].x,
            'y': static_objects[index].y,
            'visible': visible,
    }));

    $.ajax({
        url: '/ajax/changeStaticObj/',
        data: {
            'game_id': game_id,
            'obj_id': static_objects[index].id,
            'x': static_objects[index].x,
            'y': static_objects[index].y,
            'visible': visible,
        },
        dataType: 'json',
        success: function (data) {
            //console.log(data.flag);
        }
    });
}

function length(x1, y1, x2, y2)
{
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function Point(x, y)
{
    this.x = x;
    this.y = y;
}

function checkCollision(obj1, obj2)
{
    if(length(obj1.x, obj1.y, obj2.x, obj2.y) <= length(0, 0, obj1.image.width, obj1.image.height) + length(0, 0, obj2.image.width, obj2.image.height))
    {
        var mas1 = [], mas2 = [];

        mas1.push(new Point(obj1.x - obj1.image.width / 2, obj1.y - obj1.image.height / 2));
        mas1.push(new Point(obj1.x + obj1.image.width / 2, obj1.y - obj1.image.height / 2));
        mas1.push(new Point(obj1.x + obj1.image.width / 2, obj1.y + obj1.image.height / 2));
        mas1.push(new Point(obj1.x - obj1.image.width / 2, obj1.y + obj1.image.height / 2));

        mas2.push(new Point(obj2.x - obj2.image.width / 2, obj2.y - obj2.image.height / 2));
        mas2.push(new Point(obj2.x + obj2.image.width / 2, obj2.y - obj2.image.height / 2));
        mas2.push(new Point(obj2.x + obj2.image.width / 2, obj2.y + obj2.image.height / 2));
        mas2.push(new Point(obj2.x - obj2.image.width / 2, obj2.y + obj2.image.height / 2));

        for (var i = 0; i < mas1.length; ++i)
        {
            var x1 = (mas1[i].x - obj1.x) * Math.cos(obj1.angle / 180 * Math.PI) - (mas1[i].y - obj1.y) * Math.sin(obj1.angle / 180 * Math.PI) + obj1.x;
            var y1 = (mas1[i].x - obj1.x) * Math.sin(obj1.angle / 180 * Math.PI) + (mas1[i].y - obj1.y) * Math.cos(obj1.angle / 180 * Math.PI) + obj1.y;

            mas1[i].x = x1;
            mas1[i].y = y1;
        }
        for (i = 0; i < mas2.length; ++i)
        {
            x1 = (mas2[i].x - obj1.x) * Math.cos(obj1.angle / 180 * Math.PI) - (mas2[i].y - obj1.y) * Math.sin(obj1.angle / 180 * Math.PI) + obj1.x;
            y1 = (mas2[i].x - obj1.x) * Math.sin(obj1.angle / 180 * Math.PI) + (mas2[i].y - obj1.y) * Math.cos(obj1.angle / 180 * Math.PI) + obj1.y;

            mas2[i].x = x1;
            mas2[i].y = y1;
        }

        for (i = 0; i < mas1.length; ++i)
        {
            var mas = [];

            for (var j = 0; j < mas2.length; ++j)
            {
                mas.push(new Point(mas1[i].x - mas2[j].x, mas1[i].y - mas2[j].y));
            }

            var s = 0;
            const e = 0.00001;

            for (j = 0; j < mas.length - 1; ++j)
            {
                var d = mas[j].x * mas[j + 1].y - mas[j + 1].x * mas[j].y;

                if (d === 0)
                    d = 1;
                else
                    d = Math.sign(d);

                d *= Math.acos((mas[j].x * mas[j + 1].x + mas[j].y * mas[j + 1].y) / length(0, 0, mas[j].x, mas[j].y) / length(0, 0, mas[j + 1].x, mas[j + 1].y));

                s += d;
            }

            if(s > Math.PI)
                return true;
        }
    }
    return false;
}
