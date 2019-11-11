# Multiplayer Snake Game

A multiplayer snake game for browsers.

## Getting Started

run server.js to start server.
```
node server.js
```
By default server runs on port 5000 and uses http.
Connect to http://localhost:5000/ to join a local server.

```
Options:
  --version        Show version number                                 [boolean]
  --port, -p       set port of server                                   [number]
  --fps            set fps of server                                    [number]
  --spawnSize, -s  sets the number of blocks a snake spawns with        [number]
  --food, -f       sets the number of food that is spawned              [number]
  --help, -h       Show help                                           [boolean]
```

## Features
* A high score table that shows the top scores players.
* Supports user names - Lets users select which user name that they want to be known by.
* Multiplayer - Allows players to interact with the same world and compete for resources.

### Prerequisites

Uses node.js version 10
* socket.io 6.4.1 and up.
* yargs 14.2.0 and up.
* express 4.17.1 and up.
* pug 6.4.1 and up.

## Authors
Eric Nagtegaal - ewnagteg - ewnagteg@uwaterloo.ca

## License
ISC License.

## Acknowledgments
Is based on https://github.com/omgimanerd/game-framework.
