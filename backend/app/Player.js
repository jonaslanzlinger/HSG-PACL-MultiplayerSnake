const Apple = require("./fields/Apple");
const Obstacle = require("./fields/Obstacle");
const Star = require("./fields/powerups/Star");
const Inverser = require("./fields/powerups/Inverser");
const SnakeEater = require("./fields/powerups/SnakeEater");
const BackendConfig = require("../configs/backendConfig");
const e = require("express");
const Game = require("./Game");

class Player {
  constructor(socket, nickname, playerNumber, map) {
    this.socket = socket;
    this.nickname = nickname;
    this.playerNumber = playerNumber;
    this.gameOver = false;
    this.snake = this.spawnRandomSnake(map, BackendConfig.SNAKE_SPAWN_LENGTH);
    this.snakeInvulnerability = this.setSpawnInvulnerability(
      BackendConfig.SNAKE_SPAWN_INVULNERABILITY_MS
    );
    this.snakeEatability = false;
    this.direction = BackendConfig.SNAKE_SPAWN_DIRECTION;
    //Holds an inventory of available power ups that the player holds, can be consumed.
    this.powerUpInventory = []; //TODO: we might want to limit how many power ups a player can hold at a time
    this.activePowerUp = null; // Holds the identifier of the currently active powerup
    this.isPowerUpActive = false; // Flag to denote whether player currently has an ongoing powerup
    this.activeDebuffs = []; // Holds a list of active debuffs the player suffers from
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
      //TODO: the score might not only be based on the snake length (e.g. killing other snakes)
      score: this.snake.length - BackendConfig.SNAKE_SPAWN_LENGTH,
      gameOver: this.gameOver,
      snakeInvulnerability: this.snakeInvulnerability,
      powerUpInventory: this.powerUpInventory,
      activePowerUp: this.activePowerUp,
      activeDebuffs: this.activeDebuffs,
    };
  }

  //TODO: if enough time, add random spawn direction? currently snake is always horizontal and moves to the right by default
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
      this.activePowerUp = powerUpIdentifier;
      this.powerUpInventory.splice(
        this.powerUpInventory.indexOf(powerUpIdentifier),
        1
      );
    }
  }

  setDirection(direction) {
    //TODO: it's possible to move reverse by quickly pressing another direction and then back (e.g. you go right, then quickly press up,left to go left, which should not be possible)
    const oppositeDirections = {
      [BackendConfig.USER_INPUTS.UP]: BackendConfig.USER_INPUTS.DOWN,
      [BackendConfig.USER_INPUTS.DOWN]: BackendConfig.USER_INPUTS.UP,
      [BackendConfig.USER_INPUTS.LEFT]: BackendConfig.USER_INPUTS.RIGHT,
      [BackendConfig.USER_INPUTS.RIGHT]: BackendConfig.USER_INPUTS.LEFT,
    };

    // Check if the new direction is opposite to the current direction
    if (this.direction === oppositeDirections[direction]) {
      return; // If it is, don't change the direction
    }

    // Check if inverser debuff is active
    // If so, change the direction to the opposite of the user input
    if (this.activeDebuffs.includes(Inverser.IDENTIFIER)) {
      this.direction = oppositeDirections[direction];
    } else {
      this.direction = direction;
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
    // When snake moves while invulnerable, special conditions apply (e.g. cannot consume food or be hit by obstacles/snakes)
    if (this.snakeInvulnerability) {
      //Handle snake moving to the next coordinate based on user input
      let newSnakeHead = this.moveSnakeHead(1);
      if (this.isWallCollision(newSnakeHead, map)) {
        //TODO: currently, even when invulnerable a wall collision means game over.
        // Possibly handle wall collision differently (maybe move to side randomly?).
        this.gameOver = true;
        return false;
      }
      this.snake.pop();
      return true;
    }

    //Handle active debuff effect from Inverser powerup activated by another player
    const newSnakeHead = this.moveSnakeHead(1);

    //Handle regular snake move
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
    // Check if snake collides with walls of map
    if (this.isWallCollision(snakeHead, map)) {
      console.log("Player " + this.nickname + " collided with wall");
      return (this.gameOver = true);
    }

    // Check if snake collides with obstacle
    if (this.isObstacleCollision(snakeHead, Obstacle.obstacles)) {
      console.log("Player " + this.nickname + " collided with obstacle");
      return (this.gameOver = true);
    }

    // Check if snake collides with another snake
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
    // TODO: Very rarely, the snake dies because it apparently collided with an invisible one. Could not reproduce reliably, possibly adding the initial check if it's a number helped.
    if (this.snakeEatability) {
      if (
        typeof map[snakeHead.x][snakeHead.y] === "number" &&
        (map[snakeHead.x][snakeHead.y] < 0 || map[snakeHead.x][snakeHead.y] > 0)
      ) {
        if (player.snakeEatability) {
          let playernumber = map[snakeHead.x][snakeHead.y];
          if (playernumber < 0) {
            playernumber = playernumber * -1;
          }
          Game.letSnakeDie(playernumber);
          return false;
        } else {
          return true;
        }
      }
    }
  }
}

module.exports = Player;
