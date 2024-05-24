const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class Star {

    static IDENTIFIER = BackendConfig.POWERUPS.STAR.IDENTIFIER;

    // Stores positions of stars on map
    static stars = [];

    // Though the SPAWN_CHANCE_PER_SECOND denotes the percentage per second, the actual tick rate of the game
    // is 1000 / FPS, so we have to calculate the chance per tick.
    static SPAWN_CHANCE_PER_TICK = BackendConfig.POWERUPS.STAR.SPAWN_CHANCE_PER_SECOND / BackendConfig.FPS;

    constructor() { }

    /**
     * Randomly generate valid star coordinates while reflecting the desired SPAWN_CHANCE
     *
     * @param map
     * @returns {*[]}
     */
    static generateStars(map) {
        // Denotes the maximum number of stars allowed on the map
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

    /**
     * Handle the consumption of a star by a snake.
     * The star is removed from the map and the powerup is added to the inventory of the snake.
     * 
     * @param map is the current map of the game
     * @param starCoordinate is the coordinate of the star that is consumed
     * @param powerUpInventory is the inventory of the snake that consumes the star
     * @returns void
     */
    static handleSnakeConsumedStar(map, starCoordinate, powerUpInventory) {
        // After consumption, the field cell is back to normal
        map[starCoordinate.x][starCoordinate.y] = Empty.IDENTIFIER;

        // Remove the star at given coordinates from array of available stars
        this.stars = this.stars.filter(function (star) {
            return !(star.x === starCoordinate.x && star.y === starCoordinate.y);
        });

        // Add PowerUp to inventory of player
        powerUpInventory.push(Star.IDENTIFIER);
    }

    /**
     * Gain invulnerability until timeout is reached.
     *
     * @param player is the snake receiving the powerup.
     * @returns void
     */
    static activatePowerUp(player) {
        player.activePowerUps.push(Star.IDENTIFIER);
        setTimeout(() => {
            let firstPowerUpOccurrence = player.activePowerUps.indexOf(Star.IDENTIFIER);
            if (firstPowerUpOccurrence !== -1) {
                player.activePowerUps.splice(firstPowerUpOccurrence, 1);
            }
        }, BackendConfig.POWERUPS.STAR.DURATION);
    }
}

module.exports = Star;