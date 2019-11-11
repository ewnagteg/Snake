var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

var players = {};
var food = [];
var isAlive = true;
var usernames = {};

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

socket.emit('new player', username);

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

socket.on('state', function (data) {
    players = data;
});

socket.on('food', function (data) {
    food = data;
});

socket.on('usernames', function (data) {
    usernames = data;
});

function updatePlayer(id, uname, score) {
    var table = document.getElementById('highScoreTable');
    var child = table.querySelector("#"+id);
    if (child != null) {
        var scoreChild = child.querySelector('.score');
        if (scoreChild.textContent != score) {
            scoreChild.textContent = score;
        }
        var nameChild = child.querySelector('.name');
        if (nameChild.textContent != uname) {
            nameChild.textContent = uname;
        }

    } else {
        var row = document.createElement('div');
        row.setAttribute('class', 'row');
        row.setAttribute('id', id);
        table.appendChild(row);

        var name = document.createElement('div');
        name.setAttribute('class', 'name');
        name.textContent = uname;
        row.appendChild(name);

        var scoreChild = document.createElement('div');
        scoreChild.setAttribute('class', 'score');
        scoreChild.textContent = score;
        row.appendChild(scoreChild);
    }
}

setInterval(function() {
    if (!isAlive) {
        if (movement.down) {
            socket.emit('respawn');
        }
    }
    socket.emit('movement', movement);
}, 1000 / 60);

// renders game state
setInterval(function() {
    context.clearRect(0, 0, 800, 600);
    context.font = '30px sans-serif';

    // render food
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
            context.fillStyle = 'yellow';
            context.fillRect(player.blocks[0][0]*10,
                             player.blocks[0][1]*10, 10, 10);
            context.fillStyle = 'green';
            isAlive = player.alive;
            if (!player.alive) {
                context.fillStyle = 'gray';
                context.fillText('Game Over', 310, 300);
                context.fillText('Use WASD to control your snake.', 310, 340);
                context.fillText('press down to continue', 310, 380);
            }
        } else {
            context.fillStyle = player.alive ?  'orange' : 'gray';
            context.fillRect(player.blocks[0][0]*10,
                             player.blocks[0][1]*10, 10, 10);
            context.fillStyle = player.alive ? 'red' : 'grey';
        }
        for (var i=1; i<player.blocks.length; i++) {
            context.fillRect(player.blocks[i][0]*10,
            player.blocks[i][1]*10, 10, 10);
        }
    }
}, 10000 / 60);


setInterval(function() {

    let elements = [];
    let table = document.getElementById('highScoreTable');
    table.querySelectorAll('.row').forEach(el => elements.push(el));
    table.innerHTML = '';

    // sort table by player score
    elements.sort((a, b) => b.querySelector('.score').textContent - a.querySelector('.score').textContent);
    elements.forEach(function(e) {
        if (e.id in players) {
            table.appendChild(e);
        }
    });
    let getUsernames = false;
    for (id in players) {
        if (id in usernames) {
            updatePlayer(id, usernames[id], players[id].blocks.length);
        } else {
            getUsernames = true;
            updatePlayer(id, 'id: '+id, players[id].blocks.length);
        }
    }
    if (getUsernames) {
        socket.emit('get_players');
    }
}, 1000 / 10);
