const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class Inverser {

    //p for powerup, i for inverser
    static IDENTIFIER = BackendConfig.POWERUPS.INVERSER.IDENTIFIER;

    // Stores positions of inverser on map
    static inversers = [];

    // Though the SPAWN_CHANCE_PER_SECOND denotes the percentage per second, the actual tick rate of the game
    // is 1000 / FPS, so we have to calculate the chance per tick.
    static SPAWN_CHANCE_PER_TICK = BackendConfig.POWERUPS.INVERSER.SPAWN_CHANCE_PER_SECOND / BackendConfig.FPS;

    constructor() {
    }

    /**
     * Randomly generate valid inverser coordinates while reflecting the desired SPAWN_CHANCE
     *
     * @param map
     * @returns {*[]}
     */
    static generateInversers(map) {
        // Only generate stars at a rate that resembles the defined SPAWN_CHANCE
        if (Math.random() < this.SPAWN_CHANCE_PER_TICK) {
            // Generate random map field coordinates
            const x = Math.floor(Math.random() * map.length);
            const y = Math.floor(Math.random() * map[0].length);

            // Check if the field is empty
            if (map[x][y] === Empty.IDENTIFIER) {
                // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
                map[x][y] = Inverser.IDENTIFIER;

                // Store generated star in stars array
                let inverser = {
                    x: x,
                    y: y,
                };
                this.inversers.push(inverser);
            }
        }
    }

    static handleSnakeConsumedInverser(map, inverserCoordinate, powerUpInventory) {
        // After consumption, the field cell is back to normal
        map[inverserCoordinate.x][inverserCoordinate.y] = Empty.IDENTIFIER;

        // Remove the inverser at given coordinates from array of available inversers
        this.inversers = this.inversers.filter(function(inverser) {
            return !(inverser.x === inverserCoordinate.x && inverser.y === inverserCoordinate.y);
        });

        // Add PowerUp to inventory of player
        powerUpInventory.push(Inverser.IDENTIFIER);
    }

    /**
     * Inverse the movement of other players until timeout is reached.
     *
     * @param player is the snake activating the powerup.
     */
    static activatePowerUp(player) {
        //TODO: handle powerup
        //player.snakeInvulnerability = false;
        player.isPowerUpActive = true;

        setTimeout(() => {
            //player.snakeInvulnerability = false;
            player.isPowerUpActive = false;
            player.activePowerUp = null;
        }, BackendConfig.POWERUPS.INVERSER.EFFECT.INVERSE_OTHER_PLAYERS_MOVEMENT_MS);
    }
}

module.exports = Inverser;