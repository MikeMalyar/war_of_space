let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let interval = 100;

var ships = [];
var shells = [];
var images = null;
var map = null;
var player = 0;
var game_id = 0;
var curr_weap = 0;

var flag = true;

function Weapon(id, image, title)
{
    this.id = id;
    this.image = image;
    this.title = title;
}

function Shell(id, ship_id, image, speed, x, y, angle)
{
    this.id = id;
    this.ship_id = ship_id;
    this.image = image;
    this.speed = speed;
    this.angle = angle;
    this.x = x;
    this.y = y;

    this.move = function()
    {
        var speed = this.speed * interval / 1000.0;
        var dx = speed * Math.sin(this.angle / 180 * Math.PI);
        var dy = speed * Math.cos(this.angle / 180 * Math.PI);

        this.x += dx;
        this.y -= dy;
    }
}

function Ship(id, image, racing, braking, speed, rotate, angle, x, y, weapons)
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
    this.weapons = weapons;

    this.move = function()
    {
        var speed = this.speed * interval / 1000.0;
        var dx = speed * Math.sin(this.angle / 180 * Math.PI);
        var dy = speed * Math.cos(this.angle / 180 * Math.PI);

        this.x += dx;
        this.y -= dy;
    }
}

function Map(image)
{
    this.image = image;
}

function init(m, ships_list, shells_list, index, game, images_ob)
{
    map = m;
    ships = ships_list;
    shells = shells_list;
    player = index;
    game_id = game;
    images = images_ob;

    ships.sort(function(a, b){
       return(a.id - b.id);
    });

    setTimeout(function run()
    {
        if (flag)
        {
            for(var i = 0; i < shells.length; ++i)
            {
                if(shells[i].ship_id === ships[player].id)
                {
                    shells[i].move();
                }
            }

            ships[player].move();
            change(player);

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRotatedImage(map.image, 0, canvas.width / 2 - ships[player].x, canvas.height / 2 - ships[player].y);

    for(var i = 0; i < ships.length; ++i)
    {
        if(i !== player)
        {
            var x = canvas.width / 2 - (ships[player].x - ships[i].x);
            var y = canvas.height / 2 - (ships[player].y - ships[i].y);

            if(x + ships[i].image.width >= 0 && x - ships[i].image.width <= canvas.width
               && y + ships[i].image.height >= 0 && y - ships[i].image.height <= canvas.height)
            {
                drawRotatedImage(ships[i].image, ships[i].angle, x, y);
            }
        }
        else
        {
            drawRotatedImage(ships[i].image, ships[i].angle, canvas.width / 2, canvas.height / 2);
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

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 50px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("" + parseInt(String(ships[player].speed)), canvas.width, canvas.height - 100);

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
                change(player);
                break;
            case 68:
                ships[player].angle += ships[player].rotate * interval / 1000.0;
                change(player);
                break;
            case 83:
                ships[player].speed -= ships[player].braking * interval / 1000.0;
                change(player);
                break;
            case 65:
                ships[player].angle -= ships[player].rotate * interval / 1000.0;
                change(player);
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
                shoot();
                break;
        }

        draw();
    }
);

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

function change(index)
{
    $.ajax({
        url: '/ajax/change/',
        data: {
            'game_id': game_id,
            'ship_id': ships[index].id,
            'speed': ships[index].speed,
            'angle': ships[index].angle,
            'rotate': ships[index].rotate,
            'racing': ships[index].racing,
            'x': ships[index].x,
            'y': ships[index].y,
        },
        dataType: 'json',
        success: function (data) {
            //console.log(data.flag);
        }
    });
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

           var shell = new Shell(data.id, parseInt(data.ship_id), image, data.speed, parseFloat(data.x), parseFloat(data.y), parseFloat(data.angle));
           shells.push(shell);
       }
    });
}