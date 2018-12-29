let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let interval = 100;

var ships = [];
var player = 0;

var flag = true;

function Ship(image, racing, speed, rotate, angle, x, y)
{
    this.image = image;
    this.speed = speed;
    this.angle = angle;
    this.rotate = rotate;
    this.racing = racing;
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

function init(list, index)
{
    ships = list;
    player = index;

    setTimeout(function run()
    {
        if (flag)
        {
            ships[player].move();
            draw();
            setTimeout(run, interval);
        }
    }, interval);

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
}

document.addEventListener('keydown',
    function (event) {
        switch (event.keyCode) {
            case 87:
                ships[player].speed += ships[player].racing * interval / 1000.0;
                break;
            case 68:
                ships[player].angle += ships[player].rotate * interval / 1000.0;
                break;
            case 83:
                ships[player].speed -= ships[player].racing * interval / 1000.0;
                break;
            case 65:
                ships[player].angle -= ships[player].rotate * interval / 1000.0;
                break;
            case 8:
                flag = false;
                break;
        }
        draw();
    }
);

