const Apple = require("./fields/Apple");
const Empty = require("./fields/Empty");
const Obstacle = require("./fields/Obstacle");
const Star = require("./fields/powerups/Star");
const Inverser = require("./fields/powerups/Inverser");
const Player = require("./Player");
const SocketConfig = require("../configs/socketConfig");
const BackendConfig = require("../configs/backendConfig");

class Game {
    // Initialize an empty map to serve as a blank canvas
    static EMPTY_MAP = new Array(BackendConfig.MAP_SIZE).fill(Empty.IDENTIFIER).map(() => new Array(BackendConfig.MAP_SIZE).fill(Empty.IDENTIFIER));

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
            map: Game.EMPTY_MAP.map(row => [...row]),
        };
    }

    handlePlayerJoinedGame(socket, nickname) {
        let player = new Player(socket, nickname, this.nextPlayerNumber, this.gameState.map);
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
        let map = Game.EMPTY_MAP.map(row => [...row]);

        this.drawObstacles(map);
        this.drawApples(map);
        this.drawPowerUps(map);

        // Update player positions for players with gameOver false
        this.players.filter(player => !player.gameOver).forEach(player => {
            if (!player.isPowerUpActive && player.activePowerUp !== null) {
                this.handleActivePowerUp(player);
            }

            if (!player.move(this.gameState.map)) {
                this.handlePlayerGameOver(player);
            } else {
                this.drawSnake(map, player);
            }
        });

        // Update game map
        this.gameState.map = map;

        // Add all player states to gameState
        //TODO: Currently, gameState includes player indefinitely with gameOver=true but we could also remove it and do it via io.emit (not very important)
        this.gameState.players = this.players.map(player => player.getPlayerGameState());
    }

    // Game loop
    startGameLoop() {
        // For the initial game setup, add the default amount of obstacles and apples
        Obstacle.generateObstacles(this.gameState.map, BackendConfig.FIELDS.OBSTACLE.NUMBER_OF_FIELDS);
        //TODO: currently, we always have 20 apples on the map. Alternatively, add ticker that generates new apple every X seconds.
        Apple.generateApples(this.gameState.map, BackendConfig.FIELDS.APPLE.NUMBER_OF_FIELDS);

        setInterval(() => {
            // Generate random power ups on map based on each spawn_chance
            this.generatePowerUps(this.gameState.map);

            // Update game state
            this.updateGameState();

            // Emit game state to all clients
            this.io.emit(SocketConfig.EVENTS.GAME_STATE, this.gameState);
        }, 1000 / BackendConfig.FPS);
    }

    generatePowerUps() {
        Star.generateStars(this.gameState.map);
        Inverser.generateInversers(this.gameState.map);
    }

    handleActivePowerUp(player) {
        switch (player.activePowerUp) {
            case Star.IDENTIFIER:
                Star.activatePowerUp(player);
                break;
            case Inverser.IDENTIFIER:
                Inverser.activatePowerUp(player, this.players);
                break;
            default:
                break;
        }
    }

    drawObstacles(map) {
        Obstacle.obstacles.forEach((o) => {
            map[o.x][o.y] = Obstacle.IDENTIFIER;
        })
    }

    drawApples(map) {
        Apple.apples.forEach((a) => {
            map[a.x][a.y] = Apple.IDENTIFIER;
        })
    }

    drawPowerUps(map) {
        Star.stars.forEach((a) => {
            map[a.x][a.y] = Star.IDENTIFIER;
        })

        Inverser.inversers.forEach((a) => {
            map[a.x][a.y] = Inverser.IDENTIFIER;
        })
    }

    drawSnake(map, player) {
        //the snake body is denoted as the playerNumber (e.g. 2)
        player.snake.forEach((s) => {
            map[s.x][s.y] = player.playerNumber;
        });
        //the snake head is denoted as the negative playerNumber (e.g. -2)
        map[player.snake[0].x][player.snake[0].y] = -player.playerNumber;
    }
}

module.exports = Game;