const Apple = require("./fields/Apple");
const Empty = require("./fields/Empty");
const Obstacle = require("./fields/Obstacle");
const Star = require("./fields/powerups/Star");
const Inverser = require("./fields/powerups/Inverser");
const SnakeEater = require("./fields/powerups/SnakeEater");
const Player = require("./Player");
const SocketConfig = require("../configs/socketConfig");
const BackendConfig = require("../configs/backendConfig");

class Game {

  // Initialize an empty map to serve as a blank canvas
  static EMPTY_MAP = new Array(BackendConfig.MAP_SIZE)
    .fill(Empty.IDENTIFIER)
    .map(() => new Array(BackendConfig.MAP_SIZE).fill(Empty.IDENTIFIER));

  constructor(io) {
    // Initialize socket.io to emit events directly from Game class
    this.io = io;

    this.players = [];

    // Keeps track of the player numbers (used to draw map as each snake has numbered body parts)
    this.nextPlayerNumber = 1;

    // Complete game state
    this.gameState = {
      players: [],
      // initialize the map as a deep copy of the empty map template
      map: Game.EMPTY_MAP.map((row) => [...row]),
    };
  }

  /**
   * Handle player joining the game
   * 
   * @param socket
   * @param nickname
   * @returns Player
   */
  handlePlayerJoinedGame(socket, nickname) {
    let player = new Player(
      socket,
      nickname,
      this.nextPlayerNumber,
      this.gameState.map,
      this
    );
    this.players.push(player);
    this.nextPlayerNumber++;
    return player;
  }

  handlePlayerDisconnected(socket) {
    this.players = this.players.filter((p) => p.socket.id !== socket.id);
    console.log("User: " + socket.id + " disconnected");
  }

  handlePlayerGameOver(player) {
    player.gameOver = true;
    console.log("Player " + player.nickname + " has died.");
  }

  // Update game state
  updateGameState() {
    // re-initialize clean map to be drawn on as a deep copy from the empty map template
    let map = Game.EMPTY_MAP.map((row) => [...row]);

    this.drawObstacles(map);
    this.drawApples(map);
    this.drawPowerUps(map);

    // Update player positions for players with gameOver false
    this.players
      .filter((player) => !player.gameOver)
      .forEach((player) => {
        if (!player.move(this.gameState.map)) {
          this.handlePlayerGameOver(player);
        } else {
          this.drawSnake(map, player);
        }
      });

    // Update game map
    this.gameState.map = map;

    // Add all player states to gameState
    this.gameState.players = this.players.map((player) =>
      player.getPlayerGameState()
    );
  }

  /**
   * Start the game loop
   * 
   * @returns void
   */
  startGameLoop() {
    // For the initial game setup, add the default amount of obstacles and apples
    Obstacle.generateFixNumberOfObstacles(
      this.gameState.map,
      BackendConfig.FIELDS.OBSTACLE.INITIAL_SPAWN_AMOUNT
    );
    Apple.generateFixNumberOfApples(
      this.gameState.map,
      BackendConfig.FIELDS.APPLE.INITIAL_SPAWN_AMOUNT
    );

    setInterval(() => {
      // Randomly generate apples on map based on the apple spawn_chance
      Apple.generateApples(this.gameState.map);

      // Generate random power ups on map based on each spawn_chance
      this.generatePowerUps(this.gameState.map);

      // Update game state
      this.updateGameState();

      // Emit game state to all clients
      this.io.emit(SocketConfig.EVENTS.GAME_STATE, this.gameState);
    }, 1000 / BackendConfig.FPS);
  }

  /**
   * Generate power ups on the map
   */
  generatePowerUps() {
    Star.generateStars(this.gameState.map);
    Inverser.generateInversers(this.gameState.map);
    SnakeEater.generateEaters(this.gameState.map);
  }

  /**
   * Draw obstacles on the map
   * 
   * @param map
   */
  drawObstacles(map) {
    Obstacle.obstacles.forEach((o) => {
      map[o.x][o.y] = Obstacle.IDENTIFIER;
    });
  }

  /**
   * Draw apples on the map
   * 
   * @param map
   */
  drawApples(map) {
    Apple.apples.forEach((a) => {
      map[a.x][a.y] = Apple.IDENTIFIER;
    });
  }

  /**
   * Draw power ups on the map
   * 
   * @param map
   * @returns void
   */
  drawPowerUps(map) {
    Star.stars.forEach((a) => {
      map[a.x][a.y] = Star.IDENTIFIER;
    });

    Inverser.inversers.forEach((a) => {
      map[a.x][a.y] = Inverser.IDENTIFIER;
    });

    SnakeEater.eaters.forEach((a) => {
      map[a.x][a.y] = SnakeEater.IDENTIFIER;
    });
  }

  /**
   * Draw the snake on the map
   * 
   * @param map
   * @param player
   * @returns void
   */
  drawSnake(map, player) {
    // the snake body is denoted as the playerNumber (e.g. 2)
    player.snake.forEach((s) => {
      map[s.x][s.y] = player.playerNumber;
    });
    // the snake head is denoted as the negative playerNumber (e.g. -2)
    map[player.snake[0].x][player.snake[0].y] = -player.playerNumber;
  }

  /**
   * Let a snake consume a power up
   * 
   * @param player
   * @param powerUp
   * @returns void
   */
  letSnakeDie(playerNumber) {
    this.players.forEach((player) => {
      if (player.playerNumber === playerNumber) {
        player.gameOver = true;
      }
    });
  }
}

module.exports = Game;
