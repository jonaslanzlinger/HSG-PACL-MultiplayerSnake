const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class Star {

    //p for powerup, s for star
    static IDENTIFIER = BackendConfig.POWERUPS.STAR.IDENTIFIER;

    // Stores positions of stars on map
    static stars = [];

    // Though the SPAWN_CHANCE_PER_SECOND denotes the percentage per second, the actual tick rate of the game
    // is 1000 / FPS, so we have to calculate the chance per tick.
    static SPAWN_CHANCE_PER_TICK = BackendConfig.POWERUPS.STAR.SPAWN_CHANCE_PER_SECOND / BackendConfig.FPS;

    constructor() {
    }

    /**
     * Randomly generate valid star coordinates while reflecting the desired SPAWN_CHANCE
     *
     * @param map
     * @returns {*[]}
     */
    static generateStars(map) {
        //Denotes the maximum number of stars allowed on the map
        const maxStarsReached = this.stars.length >= BackendConfig.POWERUPS.STAR.MAX_ON_MAP;

        // Only generate stars at a rate that resembles the defined SPAWN_CHANCE
        if (!maxStarsReached && Math.random() < this.SPAWN_CHANCE_PER_TICK) {
            // Generate random map field coordinates
            const x = Math.floor(Math.random() * map.length);
            const y = Math.floor(Math.random() * map[0].length);

            // Check if the field is empty
            if (map[x][y] === Empty.IDENTIFIER) {
                // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
                map[x][y] = Star.IDENTIFIER;

                // Store generated star in stars array
                let star = {
                    x: x,
                    y: y,
                };
                this.stars.push(star);
            }
        }
    }

    static handleSnakeConsumedStar(map, starCoordinate, powerUpInventory) {
        // After consumption, the field cell is back to normal
        map[starCoordinate.x][starCoordinate.y] = Empty.IDENTIFIER;

        // Remove the star at given coordinates from array of available stars
        this.stars = this.stars.filter(function(star) {
            return !(star.x === starCoordinate.x && star.y === starCoordinate.y);
        });

        // Add PowerUp to inventory of player
        powerUpInventory.push(Star.IDENTIFIER);
    }

    /**
     * Gain invulnerability until timeout is reached.
     *
     * @param player is the snake receiving the powerup.
     */
    static activatePowerUp(player) {
        //TODO: think about whether we want to differentiate between spawn invulnerability and the one we get from the star powerup. Currently, it's the same flag snakeInvulnerability. Concretely, for the design, spawn might be more like "cloudy" and star more like "rainbow" snake.
        player.snakeInvulnerability = true;
        player.isPowerUpActive = true;

        setTimeout(() => {
            player.snakeInvulnerability = false;
            player.isPowerUpActive = false;
            player.activePowerUp = null;
        }, BackendConfig.POWERUPS.STAR.EFFECT.SNAKE_INVULNERABILITY_MS);
    }
}

module.exports = Star;