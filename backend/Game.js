const Apple = require("./fields/Apple");
const Empty = require("./fields/Empty");
const Obstacle = require("./fields/Obstacle");
const Player = require("./Player");

class Game {

    static FPS = 10;
    static MAP_SIZE = 60;

    // The amount of a given field to have on the map at any point in time
    static NUMBER_OF_FIELDS = {
        APPLE: 20,
        OBSTACLE: 30,
    }

    // Initialize an empty map to serve as a blank canvas
    static EMPTY_MAP = new Array(Game.MAP_SIZE).fill(Empty.IDENTIFIER).map(() => new Array(Game.MAP_SIZE).fill(Empty.IDENTIFIER));

    constructor(io) {
        // Initialize socket.io to emit events directly from Game class
        this.io = io;

        this.players = [];

        // Complete game state
        this.gameState = {
            // initialize the map as a deep copy of the empty map template
            map: Game.EMPTY_MAP.map(row => [...row]),
        };
    }

    handlePlayerJoinedGame(socket, nickname) {
        // TODO assign unique player number to each new player
        let nextPlayerNumber = 1;
        let player = new Player(socket, nickname, nextPlayerNumber, this.gameState.map);
        this.players.push(player);

        return player;
    }

    handlePlayerDisconnected(socket) {
       this.players = this.players.filter((p) => p.socket.id !== socket.id);
    }

    // Update game state
    updateGameState() {
        // re-initialize clean map to be drawn on as a deep copy from the empty map template
        let map = Game.EMPTY_MAP.map(row => [...row]);

        this.drawObstacles(map);
        this.drawApples(map);

        // Update player positions
        this.players.forEach((player) => {
            if (!player.move()) {
                this.handlePlayerCollision(player);
            } else {
                this.drawSnake(map, player);
            }
        });

        // Update game state
        this.gameState.map = map;
    }

    // Game loop
    startGameLoop() {
        // For the initial game setup, add the default amount of obstacles and apples
        Obstacle.generateObstacles(this.gameState.map, Game.NUMBER_OF_FIELDS.OBSTACLE);
        Apple.generateApples(this.gameState.map, Game.NUMBER_OF_FIELDS.APPLE);
        //TODO: currently, we always have 20 apples on the map. Alternatively, add ticker that generates new apple every X seconds.

        setInterval(() => {
            // Update game state
            this.updateGameState();

            // Emit game state to all clients
            this.io.emit("gameState", this.gameState);
        }, 1000 / Game.FPS);
    }

    handlePlayerCollision(player) {
        // Remove player from list of active players
        this.players = this.players.filter((p) => p !== player);

        //TODO: emit event that player died? what else?
        //this.io.emit("playerDied", player);
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