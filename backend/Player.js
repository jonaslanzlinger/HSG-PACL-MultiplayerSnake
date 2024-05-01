const Apple = require("./fields/Apple");

class Player {
   constructor(socket, nickname, playerNumber, map) {
      this.socket = socket;
      this.nickname = nickname;
      this.playerNumber = playerNumber;
      this.map = map;
      // Create random starting position for snake (atleast 3 cells away from the border)
      let randomX = Math.floor(Math.random() * (this.map.length - 3) + 3);
      let randomY = Math.floor(Math.random() * (this.map.length - 3) + 3);
      this.snake = [{ x: randomX, y: randomY }];
      this.snake[1] = { x: randomX - 1, y: randomY };
      this.snake[2] = { x: randomX - 2, y: randomY };
      this.direction = "d";
   }

   setDirection(direction) {
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
      let newHead = { x: head.x, y: head.y };
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
      if (this.snake[0].x < 0 || this.snake[0].x >= this.map.length || this.snake[0].y < 0 || this.snake[0].y >= this.map.length) {
         console.log("Player " + this.nickname + " collided with wall");
         return true;
      }
      return false;
   }
}

module.exports = Player;