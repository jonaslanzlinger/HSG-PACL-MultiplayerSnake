const Apple = require("./fields/Apple");
const Obstacle = require("./fields/Obstacle");
const Star = require("./fields/powerups/Star");
const Inverser = require("./fields/powerups/Inverser");
const SnakeEater = require("./fields/powerups/SnakeEater");
const BackendConfig = require("../configs/backendConfig");
const e = require("express");
const Game = require("./Game");

class Player {
  constructor(socket, nickname, playerNumber, map, game) {
    this.socket = socket;
    this.nickname = nickname;
    this.playerNumber = playerNumber;
    this.gameOver = false;
    this.snake = this.spawnRandomSnake(map, BackendConfig.SNAKE_SPAWN_LENGTH);
    this.direction = BackendConfig.SNAKE_SPAWN_DIRECTION;
    this.powerUpInventory = [];
    this.activePowerUps = [];
    Star.activatePowerUp(this);
    this.activeDebuffs = [];
    this.game = game;
  }

  /**
   * Returns the player's current game state as a JSON-ready object sent to the frontend.
   *
   * @returns {{playerNumber, score, snakeInvulnerability: *, nickname, gameOver: boolean}}
   */
  getPlayerGameState() {
    return {
      playerNumber: this.playerNumber,
      nickname: this.nickname,
      score: this.snake.length - BackendConfig.SNAKE_SPAWN_LENGTH,
      gameOver: this.gameOver,
      snakeInvulnerability: this.snakeInvulnerability,
      powerUpInventory: this.powerUpInventory,
      activePowerUp: this.activePowerUp,
      activePowerUps: this.activePowerUps,
      activeDebuffs: this.activeDebuffs,
    };
  }

  spawnRandomSnake(map, length) {
    // Create random starting position for snake.
    // As the snake is drawn horizontally, we want at least its body length as space to the left.
    // As the snake moves horizontally to the right, we want an arbitrary margin of 12 to give the player enough time to react.
    let randomX = Math.floor(Math.random() * (map.length - 20) + length);
    let randomY = Math.floor(Math.random() * (map.length - 3) + 3);

    //Create snake head at the random starting position
    let snake = [{ x: randomX, y: randomY }];

    //Fill the snake body counting cells backwards from the starting cell (by subtracting from x coordinate as the snake spawns horizontally)
    for (let snakeBodyNum = 1; snakeBodyNum < length; snakeBodyNum++) {
      snake[snakeBodyNum] = { x: randomX - snakeBodyNum, y: randomY };
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

  // Use powerUp from inventory if it exists
  usePowerUp(powerUpIdentifier) {
    // Move powerUp from inventory to active
    // and remove one instance of the powerUp from the inventory
    if (this.powerUpInventory.includes(powerUpIdentifier)) {

      // Remove powerUp from inventory
      this.powerUpInventory.splice(
        this.powerUpInventory.indexOf(powerUpIdentifier),
        1
      );

      // STAR
      if (powerUpIdentifier === Star.IDENTIFIER) {
        Star.activatePowerUp(this);
      }

      // INVERTER
      if (powerUpIdentifier === Inverser.IDENTIFIER) {
        Inverser.activatePowerUp(this, this.game.players);
      }

      // SNAKE EATER
      if (powerUpIdentifier === SnakeEater.IDENTIFIER) {
        SnakeEater.activatePowerUp(this);
      }
    }
  }

  setDirection(direction) {

    let previousDirection = this.direction;

    const oppositeDirections = {
      [BackendConfig.USER_INPUTS.UP]: BackendConfig.USER_INPUTS.DOWN,
      [BackendConfig.USER_INPUTS.DOWN]: BackendConfig.USER_INPUTS.UP,
      [BackendConfig.USER_INPUTS.LEFT]: BackendConfig.USER_INPUTS.RIGHT,
      [BackendConfig.USER_INPUTS.RIGHT]: BackendConfig.USER_INPUTS.LEFT
    };

    // Check if the new direction is opposite to the current direction
    if (this.direction === oppositeDirections[direction] || this.direction === direction) {
      return; // If it is, don't change the direction
    }

    // Check if inverser debuff is active
    // If so, change the direction to the opposite of the user input
    if (this.activeDebuffs.includes(Inverser.IDENTIFIER)) {
      this.direction = oppositeDirections[direction]
    } else {
      this.direction = direction;
    }

    // For both (normal and inversed) check, if the direction is leading to moving into the snake's body itself.
    // If so, the snake should not move in the specified direction and ignore the user input.
    // This is done by checking if the snake's head is moving into the snake's body (the second element of the snake array).
    if (this.direction === BackendConfig.USER_INPUTS.UP && this.snake[0].x === this.snake[1].x && this.snake[0].y - 1 === this.snake[1].y
      || this.direction === BackendConfig.USER_INPUTS.DOWN && this.snake[0].x === this.snake[1].x && this.snake[0].y + 1 === this.snake[1].y
      || this.direction === BackendConfig.USER_INPUTS.LEFT && this.snake[0].x - 1 === this.snake[1].x && this.snake[0].y === this.snake[1].y
      || this.direction === BackendConfig.USER_INPUTS.RIGHT && this.snake[0].x + 1 === this.snake[1].x && this.snake[0].y === this.snake[1].y
    ) {
      this.direction = previousDirection;
    }
  }

  /**
   * Move the snake based on the user input's direction.
   *
   * Return true if move was successful.
   * Returns false if snake could not move in the specified direction (e.g. collided with obstacle).
   *
   * @returns {boolean} whether snake move was a success.
   */
  move(map) {

    //Handle active debuff effect from Inverser powerup activated by another player
    const newSnakeHead = this.moveSnakeHead(1);

    if (this.collides(newSnakeHead, map)) {
      return false;
    }

    // Handle all snake consumptions (ie. when snake head collides with consumable coordinate)
    switch (map[newSnakeHead.x][newSnakeHead.y]) {
      case Apple.IDENTIFIER:
        // Snake automatically increases in size by 1 by not popping the last element (the snake's tail)
        Apple.handleSnakeConsumedApple(map, newSnakeHead);
        break;
      case Star.IDENTIFIER:
        Star.handleSnakeConsumedStar(map, newSnakeHead, this.powerUpInventory);
        this.snake.pop();
        break;
      case Inverser.IDENTIFIER:
        Inverser.handleSnakeConsumedInverser(
          map,
          newSnakeHead,
          this.powerUpInventory
        );
        this.snake.pop();
        break;
      case SnakeEater.IDENTIFIER:
        SnakeEater.handleSnakeConsumedEater(
          map,
          newSnakeHead,
          this.powerUpInventory
        );
        this.snake.pop();
        break;
      default:
        this.snake.pop(); //Snake should not increase in size
    }
    return true;
  }

  /**
   * Moves the snake's head by specified number of steps in the specified direction provided by user input
   *
   * @param numberOfSteps is the number of steps the snake should move at once
   *
   * @returns {{x, y}} the new coordinate of the snake head
   */
  moveSnakeHead(numberOfSteps) {
    let snakeHead = { x: this.snake[0].x, y: this.snake[0].y };
    switch (this.direction) {
      case BackendConfig.USER_INPUTS.UP:
        snakeHead.y -= numberOfSteps;
        break;
      case BackendConfig.USER_INPUTS.LEFT:
        snakeHead.x -= numberOfSteps;
        break;
      case BackendConfig.USER_INPUTS.DOWN:
        snakeHead.y += numberOfSteps;
        break;
      case BackendConfig.USER_INPUTS.RIGHT:
        snakeHead.x += numberOfSteps;
        break;
    }
    this.snake.unshift(snakeHead);
    return snakeHead;
  }

  collides(snakeHead, map) {

    if (this.isWallCollision(snakeHead, map)) {
      console.log("Player " + this.nickname + " collided with wall");
      return (this.gameOver = true);
    }

    if (this.isObstacleCollision(snakeHead, Obstacle.obstacles)) {
      console.log("Player " + this.nickname + " collided with obstacle");
      return (this.gameOver = true);
    }

    if (this.isSnakeCollision(snakeHead, map)) {
      console.log("Player " + this.nickname + " collided with another snake");
      return (this.gameOver = true);
    }

    return false;
  }

  isWallCollision(snakeHead, map) {
    return (
      snakeHead.x < 0 ||
      snakeHead.x >= map.length ||
      snakeHead.y < 0 ||
      snakeHead.y >= map[0].length
    );
  }

  isObstacleCollision(snakeHead, obstacles) {
    if (this.activePowerUps.includes(Star.IDENTIFIER)) { return false }
    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].x === snakeHead.x && obstacles[i].y === snakeHead.y) {
        return true;
      }
    }
  }

  /**
   *  Check whether the snake head moved to a field that contains a value smaller or greater than 0
   *
   *  This works because all snakes are denoted as numbers on the map, with the snake head being a negative number and its body the respective positive number
   *  All other fields (apples, etc) are denoted as strings
   *
   *  For example: snake head is denoted as -2 and the snake body is denoted as 2
   *
   * @param snakeHead the new coordinate of the snake head to verify
   * @param map the map to verify on
   *
   * @returns {boolean} whether the snake head moved into another snake
   */
  isSnakeCollision(snakeHead, map) {
    if (this.activePowerUps.includes(SnakeEater.IDENTIFIER)) {
      if (
        typeof map[snakeHead.x][snakeHead.y] === "number" &&
        (map[snakeHead.x][snakeHead.y] < 0 || map[snakeHead.x][snakeHead.y] > 0)
      ) {
        // Get the player number and make it positive
        let playernumber = map[snakeHead.x][snakeHead.y];
        if (playernumber < 0) {
          playernumber = playernumber * -1;
        }

        // Let the snake die
        this.game.letSnakeDie(playernumber);
        return false;
      }
    } else {
      return (
        typeof map[snakeHead.x][snakeHead.y] === "number" &&
        (map[snakeHead.x][snakeHead.y] < 0 || map[snakeHead.x][snakeHead.y] > 0 && !this.activePowerUps.includes(Star.IDENTIFIER))
      );
    }
  }
}

module.exports = Player;
