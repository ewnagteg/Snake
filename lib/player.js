module.exports.Move = function() {
    this.up = false;
    this.down = true;
    this.right = false;
    this.left = false;
};

module.exports.Player = function(x, y, size) {
    this.blocks = [[x, y]];
    for (var i=0; i<10; i++) {
        this.blocks.push([x,y-i]);
    }
    this.alive = true;
};

module.exports.update = function(player, move, food) {
    if (player.alive) {

        // calculate position of head
        var next = [player.blocks[0][0], player.blocks[0][1]];
        if (move.up) {
            next[1] -= 1;
        } else if (move.down) {
            next[1] += 1;
        } else if (move.left) {
            next[0] -= 1;
        } else if (move.right) {
            next[0] += 1;
        } else {
            next = [next[0] + player.blocks[0][0] - player.blocks[1][0],
                    next[1] + player.blocks[0][1] - player.blocks[1][1]];
        }

        // check to see if dead
        // if we die, we continue since otherwise the dead snake looks weird
        for (var j=0; j<player.blocks.length; j++) {
            if (next[0] == player.blocks[j][0] &&
                    next[1] == player.blocks[j][1]) {
                player.alive = false;
                break;
            }
        }
        if (next[0] <= 0 || next[0] >= 800 / 10 ||
                next[1] <= 0 || next[1] >= 600 / 10) {
            player.alive = false;
        }

        // insert new head and then pop off end of tail
        player.blocks.splice(0, 0, next);
        player.blocks.pop();

        // so we don't eat when dead
        if(!player.alive) return;

        // check to see if the head is on food
        for (var i=0; i<food.length; i++) {
            if (food[i][0] == player.blocks[0][0] &&
                food[i][1] == player.blocks[0][1]) {
                    player.blocks.push([food[i][0], food[i][1]]);
                    food.splice(i, 1); // remove food element that we ate
            }
        }
    }
};
