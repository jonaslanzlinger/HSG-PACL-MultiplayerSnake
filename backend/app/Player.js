const Apple = require("./fields/Apple");
const Obstacle = require("./fields/Obstacle");
const BackendConfig = require("../configs/backendConfig");

class Player {
    constructor(socket, nickname, playerNumber, map) {
        this.socket = socket;
        this.nickname = nickname;
        this.playerNumber = playerNumber;
        this.gameOver = false;
        this.map = map;
        this.snake = this.spawnRandomSnake(BackendConfig.SNAKE_SPAWN_LENGTH);
        this.snakeInvulnerability = this.setSpawnInvulnerability(BackendConfig.SNAKE_SPAWN_INVULNERABILITY_MS);
        this.direction = BackendConfig.SNAKE_SPAWN_DIRECTION;
        //TODO: this.powerUpInventory -> holds a queue of power ups that player holds. Then be able to use it with spacebar?
    }

    /**
     * Returns the player's current game state as a JSON-ready object sent to the frontend.
     *
     * @returns {{playerNumber, score, snakeInvulnerability: *, nickname, gameOver: boolean}}
     */
    getPlayerGameState() {
        return {
            //TODO: omit fields altogether that are false (gameOver, snakeInvulnerability, ...)
            playerNumber: this.playerNumber,
            nickname: this.nickname,
            score: this.snake.length - BackendConfig.SNAKE_SPAWN_LENGTH, //TODO: the score might not only be based on the snake length (e.g. killing other snakes)
            gameOver: this.gameOver,
            snakeInvulnerability: this.snakeInvulnerability
            //powerUpInventory: [], //TODO: add first Star.js to become invulnerable
            //activePowerUp: null,
            //activeDebuff: null,
        };
    }

    //TODO: if enough time, add random spawn direction? currently snake is always horizontal and moves to the right by default
    spawnRandomSnake(length) {
        // Create random starting position for snake.
        // As the snake is drawn horizontally, we want at least its body length as space to the left.
        // As the snake moves horizontally to the right, we want an arbitrary margin of 6 to give the player enough time to react.
        let randomX = Math.floor(Math.random() * (this.map.length - 6) + length);
        let randomY = Math.floor(Math.random() * (this.map.length - 3) + 3);

        //Create snake head at the random starting position
        let snake = [{x: randomX, y: randomY}];

        //Fill the snake body counting cells backwards from the starting cell (by subtracting from x coordinate as the snake spawns horizontally)
        for (let snakeBodyNum = 1; snakeBodyNum < length; snakeBodyNum++) {
            snake[snakeBodyNum] = {x: randomX - snakeBodyNum, y: randomY};
        }

        return snake;
    }

    setSpawnInvulnerability(invulnerableMs) {
        // After defined invulnerability in ms, set the snake invulnerability back to false
        setTimeout(() => {
            this.snakeInvulnerability = false;
        }, invulnerableMs);

        // Set the snake to invulnerable, but will be automatically changed to false after timeout is reached
        return true;
    }

    setDirection(direction) {
        //TODO: if statement tries to prevent the snake from turning backwards (into itself), but quickly pressing another direction and then back still makes it possible for the snake to move back through itself.
        if (this.direction === "w" && direction === "s"
            || this.direction === "s" && direction === "w"
            || this.direction === "a" && direction === "d"
            || this.direction === "d" && direction === "a") {
            return;
        }
        this.direction = direction;
    }

    move() {
        let head = this.snake[0];
        let newHead = {x: head.x, y: head.y};
        switch (this.direction) {
            case "w":
                newHead.y -= 1;
                break;
            case "a":
                newHead.x -= 1;
                break;
            case "s":
                newHead.y += 1;
                break;
            case "d":
                newHead.x += 1;
                break;
        }
        this.snake.unshift(newHead);

        // Ignore collision detection if snake is invulnerable. Snake cannot eat apples either.
        if (this.snakeInvulnerability) {
            this.snake.pop();
            //TODO: handle snake going outside the map while invulnerable (because it cannot hit the wall..)
            return true;
        }

        if (this.collides()) {
            return false;
        }

        // Handle snake eating apple
        if (this.map[newHead.x][newHead.y] === Apple.IDENTIFIER) {
            // Snake automatically increases in size by 1 by not popping the last element (the snake's tail)
            Apple.handleSnakeConsumedApple(this.map, newHead)
        } else {
            this.snake.pop();
        }

        return true;
    }

    collides() {
        const snakeHead = this.snake[0];

        // Check if snake collides with walls of map
        if (snakeHead.x < 0 || snakeHead.x >= this.map.length || snakeHead.y < 0 || snakeHead.y >= this.map.length) {
            console.log("Player " + this.nickname + " collided with wall");
            return this.gameOver = true;
        }

        // Check if snake collides with obstacle
        if (this.isObstacleCollision(snakeHead, Obstacle.obstacles)) {
            console.log("Player " + this.nickname + " collided with obstacle");
            return this.gameOver = true;
        }

        // Check if snake collides with another snake
        if (this.isSnakeCollision(snakeHead, Obstacle.obstacles)) {
            console.log("Player " + this.nickname + " collided with another snake");
            return this.gameOver = true;
        }

        return false;
    }

    isObstacleCollision(snakeHead, obstacles) {
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].x === snakeHead.x && obstacles[i].y === snakeHead.y) {
                return true;
            }
        }
    }

    isSnakeCollision(snakeHead, snakes) {
        //TODO: implement logic to check if snake collides with another snake
        return false;
    }
}

module.exports = Player;