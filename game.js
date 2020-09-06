var canvas = document.getElementById('myGame');
var ctx = canvas.getContext('2d');

// main game object
var pong = {};

//ball constructor
function Ball(radius, color) {
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.radius = radius;
    this.color = color;
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

//player construktor
function Player(name, width, length, offset, color) {
    this.x = 0;
    this.y = 0;
    this.score = 0;
    this.name = name;
    this.width = width;
    this.length = length;
    this.offset = offset;
    this.color = color;
    this.upMove = false;
    this.downMove = false;
    this.draw = function () {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.length);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

//game initialization
function gameInit() {
    pong.state = 0  // 0:start, 1:in game, 2:add point, 3:end
    pong.pause = true;
    pong.ball = new Ball(10, '#AA6939');
    pong.players = [];
    pong.players[0] = new Player('Left Player', 15, 60, 7, '#AA6939');
    pong.players[1] = new Player('Right Player', 15, 60, 7, '#AA6939');
    pong.lifes = 10;
    pong.winner = 0;
    gameReset();
}

//gameReset
function gameReset() {
    pong.ball.x = canvas.width/2;
    pong.ball.y = canvas.height/2;
    pong.pause = true;
    pong.ball.offsetX = 6;
    pong.ball.offsetY = 2;
    pong.players[0].x = 0;
    pong.players[1].x = canvas.width - pong.players[1].width;
    pong.players[0].y = (canvas.height - pong.players[0].length)/2;
    pong.players[1].y = (canvas.height - pong.players[1].length)/2;
}

//keypress events
function keyDownHandler(e) {
    if (e.keyCode == 65) { pong.players[0].upMove = true } else
    if (e.keyCode == 75) { pong.players[1].upMove = true } else
    if (e.keyCode == 90) { pong.players[0].downMove = true } else
    if (e.keyCode == 77) { pong.players[1].downMove = true} else
    if (e.keyCode == 32) { pong.pause = !pong.pause }
}

function keyUpHandler(e) {
    if (e.keyCode == 65) { pong.players[0].upMove = false } else
    if (e.keyCode == 75) { pong.players[1].upMove = false } else
    if (e.keyCode == 90) { pong.players[0].downMove = false } else
    if (e.keyCode == 77) { pong.players[1].downMove = false }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

//check if bouncing
function checkBouncing(rect, circle) {
    var dx = Math.abs(circle.x - (rect.x + rect.width/2));
    var dy = Math.abs(circle.y - (rect.y + rect.length/2));

    if (dx > circle.radius + rect.width/2) { return false};
    if (dy > circle.radius + rect.length/2) { return false};
    if (dx <= rect.width) { return true};
    if (dx <= rect.length) { return true};

    var dx = dx - rect.width;
    var dy = dy - rect.length;

    return (dx*dx + dy*dy <= circle.radius*circle.radius)
}

//score display
function scoreDisplay() {
    ctx.font = '14px Verdana';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText(pong.players[0].name + ": " + pong.players[0].score, 20, 20); 
    ctx.textAlign = 'right';
    ctx.fillText(pong.players[1].name + ": " + pong.players[1].score, canvas.width - 20, 20); 
}

//header
function headerDisplay(text) {
    ctx.font = '22px Verdana';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width/2, 60);
}

//display info
function infoDisplay(text) {
    ctx.font = '14px Verdana';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width/2, 90);
}

//draw game state
function drawGame() {
    pong.ball.draw();
    pong.players[0].draw();
    pong.players[1].draw();
    scoreDisplay();
}

//gameTransform
function gameTransform() {
    //move ball by offset
    pong.ball.x += pong.ball.offsetX;
    pong.ball.y += pong.ball.offsetY;

    //bounce from top and bot
    if (pong.ball.y + pong.ball.radius/2 >= canvas.height || pong.ball.y - pong.ball.radius/2 <= 0) {
        pong.ball.offsetY = -pong.ball.offsetY;
    }

    //player service
    for (i=0; i<pong.players.length; i++) {
        //move Up
        if (pong.players[i].upMove && pong.players[i].y > 0) {
            pong.players[i].y -= pong.players[i].offset;
            
        } 
        //move down
        if (pong.players[i].downMove && pong.players[i].y + pong.players[i].length < canvas.height) {
            pong.players[i].y += pong.players[i].offset;
        }
        //bounce ball
        if (checkBouncing(pong.players[i], pong.ball)) {
            pong.ball.offsetX = -pong.ball.offsetX;

            if (pong.players[i].moveUp) { pong.ball.offsetY-- };
            if (pong.players[i].moveDown) { pong.ball.offsetY++ };
        }
    }

    //add point
    if (pong.ball.x < pong.players[0].width) {
        pong.players[1].score++;
        pong.state = 2;
        pong.pause = true;
    }
    if (pong.ball.x > canvas.width - pong.players[1].width) {
        pong.players[0].score++;
        pong.state = 2;
        pong.pause = true;
    }

    //player win
    for (i=0; i<pong.players.length; i++) {
        if (pong.players[i].score == pong.lifes) {
            pong.state = 3;
            pong.pause = true;
            pong.winner = i;
        }
   }
}


//main function with logic
function play() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGame();
    

    if (pong.pause) {
        switch(pong.state) {
            case 0:
                headerDisplay('Move by A,Z and K,M');
                infoDisplay('Press space');
                break;
            case 2:
                gameReset();
                headerDisplay('Point!');
                infoDisplay('Press space');
                break;
            case 3:
                gameReset();
                headerDisplay(pong.players[pong.winner].name + ' won!');
                infoDisplay('Next game - press space');
                break;
            default:
                headerDisplay('Move by A,Z and K,M');
                infoDisplay('To play press space');
        }
    } else {
        switch(pong.state) {
            case 0: 
            case 2:
                pong.state = 1;
                break;
            case 3:
                gameInit();
                break;
            default:
                gameTransform();
        }
    }
    requestAnimationFrame(play);
}

//starting game
gameInit();
play();


