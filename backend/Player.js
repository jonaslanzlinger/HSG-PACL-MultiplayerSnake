class Player {
   constructor(socket, nickname, playerNumber) {
      this.socket = socket;
      this.nickname = nickname;
      this.playerNumber = playerNumber;
      let randomX = Math.floor(Math.random() * 30);
      let randomY = Math.floor(Math.random() * 30);
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
      this.snake.pop();
   }
}

module.exports = Player;