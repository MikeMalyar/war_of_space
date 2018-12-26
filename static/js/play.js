let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let x=0, y=0, w=20, h=20;

function init() {
    console.log("hello");
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x, y, w, h);
}

document.addEventListener('keypress',
    function (event) {
        switch (event.key) {
            case 'w':
                y-=10;
                break;
            case 'd':
                x+=10;
                break;
            case 's':
                y+=10;
                break;
            case 'a':
                x-=10;
                break;
            }
        draw();
    }
);