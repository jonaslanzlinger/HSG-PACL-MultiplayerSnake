const Apple = require("./fields/Apple");
const Obstacle = require("./fields/Obstacle");

class Player {
    constructor(socket, nickname, playerNumber, map) {
        this.socket = socket;
        this.nickname = nickname;
        this.playerNumber = playerNumber;
        this.gameOver = false;
        this.map = map;
        // Create random starting position for snake (atleast 3 cells away from the border)
        let randomX = Math.floor(Math.random() * (this.map.length - 3) + 3);
        let randomY = Math.floor(Math.random() * (this.map.length - 3) + 3);
        this.snake = [{x: randomX, y: randomY}];
        this.snake[1] = {x: randomX - 1, y: randomY};
        this.snake[2] = {x: randomX - 2, y: randomY};
        this.direction = "d";
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