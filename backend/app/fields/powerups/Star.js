const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class Star {

    //p for powerup, s for star
    static IDENTIFIER = BackendConfig.POWERUPS.STAR.IDENTIFIER;

    // Stores positions of stars on map
    static stars = [];

    constructor() {
    }

    /**
     * Randomly generate valid star coordinates on the map until numberOfStarsToBeGenerated is reached
     *
     * @param map
     * @param numberOfStarsToBeGenerated
     * @returns {*[]}
     */
    static generateStars(map, numberOfStarsToBeGenerated= 1) {
        // Until we reach the desired number of newly generated fields, select a random field on the map and try to change it into the new field
        let count = 0;
        while (count < numberOfStarsToBeGenerated) {
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
                count++;
            }
        }
        return this.stars;
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
        //TODO: Add second value if we want to visually differentiate between spawn and star invulnerability (e.g. spawn might be more "cloudy" and star might make the snake more "star-like")
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