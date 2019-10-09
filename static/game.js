var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    dead : false
};

var players = {};
var food = [];
var highScore = 40;

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

socket.on('state', function(data) {
    players = data;
});

socket.on('food', function(data) {
    food = data;
});

socket.on('highscore', function(data) {
    highScore = data;
});

setInterval(function() {
    if (movement.dead) {
        if (movement.down) {
            socket.emit('respawn');
        }
    }
    socket.emit('movement', movement);
}, 1000 / 60);

setInterval(function() {
    // render
    context.clearRect(0, 0, 800, 600);
    context.font = '30px sans-serif';
    context.fillStyle = 'blue';
    for (var j=0; j<food.length; j++) {
        context.fillRect(food[j][0]*10,
        food[j][1]*10, 10, 10);
    }

    for (var id in players) {
        var player = players[id];
        if (id == socket.id) {
            context.fillStyle = 'black';
            context.fillText('Score: '+player.blocks.length, 10, 30);
            context.fillStyle = 'green';

            if (!player.alive) {
                context.fillStyle = 'black';
                context.fillText('Game Over', 310, 300);
                context.fillText('press down to continue', 210, 340);
                context.fillStyle = 'gray';
                movement.dead = true;
            } else {
                movement.dead = false;
            }

        } else {
            context.fillStyle = 'red';
            if (!player.alive) {
                context.fillStyle = 'gray';
            }

        }
        for (var i=0; i<player.blocks.length; i++) {
            context.fillRect(player.blocks[i][0]*10,
            player.blocks[i][1]*10, 10, 10);
        }
    }

    context.fillStyle = 'black';
    context.fillText('High Score: '+highScore, 300, 30);
}, 10000 / 60);
