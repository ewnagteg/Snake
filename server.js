// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var player = require('./src/player.js');
var args = process.argv.slice(2);

var port = 5000;
var fps = 20;
if (args.length >= 1) {
    port = parseInt(args[0]);
    if (isNaN(port)) {
        console.log("invalid port: "+args[0]);
        port = 5000;
    }
}


if (args.length >= 2) {
    fps = parseInt(args[1]);
    if (isNaN(port)) {
        console.log("invalid fps: "+args[1]);
        fps = 20;
    }
}


app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, function() {
    console.log('Starting server on port '+port + ' with fps: '+fps);
});

var players = {};
var food = [];
var highScore = 0;


for (var i=0; i<1; i++) {
    addOneFood();
}

function addOneFood() {
    food.push([Math.floor((Math.random() * 79) + 1),
                            Math.floor((Math.random() * 49) + 1)]);
}

function gameUpdate() {
    for (var k in players) {
        var player = players[k];
        player.update(food);
        if (player.blocks.length > highScore) {
            highScore = player.blocks.length;
        }
    }
    if (food.length < 1) {
        addOneFood();
    }

}

io.on('connection', function(socket) {

	    socket.on('new player', function () {
    		players[socket.id] = new player.Player(30, 30);
	    });

        socket.on('respawn', function () {
            delete players[socket.id];
            players[socket.id] = new player.Player(30, 30);
        });

        socket.on('disconnect', function (reason) {
                delete players[socket.id];
        });

	    socket.on('movement', function(data) {
            if (socket.id in players) {
	            var player = players[socket.id];
                if (data.left) {
                    player.move.left = true;
                } else {
                    player.move.left = false;
                }

                if (data.up) {
                    player.move.up = true;
                } else {
                    player.move.up = false;
                }

                if (data.right) {
                    player.move.right = true;
                } else {
                    player.move.right = false;
                }

                if (data.down) {
                    player.move.down = true;
                } else {
                    player.move.down = false;
                }
            }
	    });
});


setInterval(function() {
     io.sockets.emit('highscore', highScore);
     },
     1000 / 10
);

setInterval(function() {
    gameUpdate();
    io.sockets.emit('state', players);
    io.sockets.emit('food', food);
    },
    1000 / fps
);
