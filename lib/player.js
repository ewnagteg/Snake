Move = function() {
    this.up = false;
    this.down = true;
    this.right = false;
    this.left = false;

    this.set = function (move) {
        this.up = move.up;
        this.down = move.down;
        this.right = move.right;
        this.left = move.left;
    };

    this.isMoving = function () {
        return this.up || this.down || this.right || this.left;
    };
};

module.exports.Player = function(x, y) {
    this.blocks = [[x, y]];
    for (var i=0; i<10; i++) {
        this.blocks.push([x,y-i]);
    }
    this.move = new Move();
    this.lastMove = new Move();
    this.alive = true;

    this.insert = function (move) {
        this.blocks.splice(0, 0, move);
    };
    this.update = function (food) {
        if (this.alive) {
            // calculate position of head
            var move = [this.blocks[0][0], this.blocks[0][1]];
            if (!this.move.isMoving()) {
                this.move.set(this.lastMove);
            }
            if (this.move.up) {
                move[1] -= 1;
            } else if (this.move.down) {
                move[1] += 1;
            } else if (this.move.left) {
                move[0] -= 1;
            } else if (this.move.right) {
                move[0] += 1;
            }

            this.lastMove.set(this.move);

            for (var j=0; j<this.blocks.length; j++) {
                if (move[0] == this.blocks[j][0] &&
                        move[1] == this.blocks[j][1]) {
                    this.alive = false;
                }
            }
            if (move[0] <= 0 || move[0] >= 800 / 10 ||
                    move[1] <= 0 || move[1] >= 600 / 10) {
                this.alive = false;
            }
            // insert new head and then pop off end of tail
            this.insert(move);
            this.blocks.pop();

            // check to see if the head is on food
            for (var i=0; i<food.length; i++) {
                if (food[i][0] == this.blocks[0][0] &&
                    food[i][1] == this.blocks[0][1]) {
                        this.blocks.push([food[i][0], food[i][1]]);
                        food.splice(i, 1);
                }
            }
        }
    };
};
