// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const pug = require('pug'); // use pug to get username of player

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var player = require('./lib/player.js'); // imports player functions

var port = 5000;
var fps = 20;
var spawnSize = 10;

// number of food objects that should be spawned
var foodSize = 1;

// holds player's data
var players = {};

// holds player's input data
var playerMoves = {};

// holds food
var food = [];

// users -- socket.id : username=
var users = {};

// used user names - username : socket.id
var usernames = {};
usernames.admin = null;

// parse arguements
const yargs = require('yargs');

const argv = yargs.options({
        'port': {
            alias: 'p',
            describe: 'set port of server',
            type: 'number'
        },
        'fps': {
            describe: 'set fps of server',
            type: 'number'
        },
        'spawnSize': {
            alias: 's',
            describe: 'sets the number of blocks a snake spawns with',
            type: 'number'
        },
        'food': {
            alias: 'f',
            describe: 'sets the number of food that is spawned',
            type: 'number'
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.port) {
    port = argv.port;
}

if (argv.fps) {
    fps = argv.fps;
}

if (argv.spawnSize) {
    spawnSize = argv.spawnSize;
}

if (argv.food) {
    foodSize = argv.food;
}

server.listen(port, function() {
    console.log('Starting server on port '+port + ' with fps: '+fps);
});

app.use(express.urlencoded())
app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
    if ( request.query.username) {
        response.render(path.join(__dirname, '/views/index.pug'), {username: request.query.username});
    } else {
        response.redirect('/submit');
    }
});

app.get('/submit', function(request, response) {
    response.render(path.join(__dirname, '/views/signin.pug'), {});
});

app.post('/add_user', function (req, res) {
     if (req.body.username in usernames) {
         res.render(path.join(__dirname, '/views/signin.pug'), {response: 'used'});

     } else {
         res.redirect('/?username='+req.body.username);
     }
});

for (let i=0; i<foodSize; i++) {
    addOneFood();
}

function addOneFood() {
    food.push([Math.floor((Math.random() * 79) + 1),
                            Math.floor((Math.random() * 49) + 1)]);
}

function gameUpdate() {
    for (let key in players) {
        let p = players[key];
        let move = playerMoves[key];
        player.update(p, move, food);
    }
    if (food.length < foodSize) {
        addOneFood();
    }
}

io.on('connection', function(socket) {

	    socket.on('new player', function (username) {
            if (username in usernames) {
                socket.emit('redirect', '/');
            } else {
                players[socket.id] = new player.Player(30, 30, spawnSize);
                playerMoves[socket.id] = new player.Move();
                users[socket.id] = username;
                usernames[username] = socket.id
            }
	    });

        socket.on('get_players', function () {
            socket.emit('usernames', users);
        });

        socket.on('respawn', function () {
            delete players[socket.id];
            players[socket.id] = new player.Player(30, 30, spawnSize);
        });

        socket.on('disconnect', function (reason) {
                delete players[socket.id];
                delete playerMoves[socket.id];
                delete usernames[users[socket.id]];
                delete users[socket.id];
        });

	    socket.on('movement', function(data) {
            if (socket.id in players) {
                try {
    	            let move = playerMoves[socket.id];
                    if (data.left) {
                        move.left = true;
                    } else {
                        move.left = false;
                    }

                    if (data.up) {
                        move.up = true;
                    } else {
                        move.up = false;
                    }

                    if (data.right) {
                        move.right = true;
                    } else {
                        move.right = false;
                    }

                    if (data.down) {
                        move.down = true;
                    } else {
                        move.down = false;
                    }
                } catch (err) {
                    console.log('error parsing client movement: '+err.message);
                    console.log('client: '+socket.id);
                }
            }
	    });
});

setInterval(function() {
    gameUpdate();
    io.sockets.emit('state', players);
    io.sockets.emit('food', food);
    },
    1000 / fps
);
