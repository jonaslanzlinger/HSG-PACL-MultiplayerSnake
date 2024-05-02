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
        this.direction = BackendConfig.SNAKE_SPAWN_DIRECTION;
    }

    //TODO: if enough time, add random spawn direction? currently snake is always horizontal and moves to the right by default
    spawnRandomSnake(length) {
        // Create random starting position for snake (atleast 3 cells away from the border, but 6 for the direction it's moving)
        let randomX = Math.floor(Math.random() * (this.map.length - 6) + 3);
        let randomY = Math.floor(Math.random() * (this.map.length - 3) + 3);

        //Create snake head at the random starting position
        let snake = [{x: randomX, y: randomY}];

        //Fill the snake body counting cells backwards from the starting cell (by subtracting from x coordinate as the snake spawns horizontally)
        for (let snakeBodyNum = 1; snakeBodyNum < length; snakeBodyNum++) {
            snake[snakeBodyNum] = {x: randomX - snakeBodyNum, y: randomY};
        }

        return snake;
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