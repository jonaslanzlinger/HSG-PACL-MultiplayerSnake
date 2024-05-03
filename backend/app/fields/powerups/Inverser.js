const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class Inverser {

    //p for powerup, i for inverser
    static IDENTIFIER = BackendConfig.POWERUPS.INVERSER.IDENTIFIER;

    // Stores positions of inverser on map
    static inversers = [];

    constructor() {
    }

    /**
     * Randomly generate valid inverser coordinates on the map until numberOfInversersToBeGenerated is reached
     *
     * @param map
     * @param numberOfInversersToBeGenerated
     * @returns {*[]}
     */
    static generateInversers(map, numberOfInversersToBeGenerated= 1) {
        // Until we reach the desired number of newly generated fields, select a random field on the map and try to change it into the new field
        let count = 0;
        while (count < numberOfInversersToBeGenerated) {
            // Generate random map field coordinates
            const x = Math.floor(Math.random() * map.length);
            const y = Math.floor(Math.random() * map[0].length);

            // Check if the field is empty
            if (map[x][y] === Empty.IDENTIFIER) {
                // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
                map[x][y] = Inverser.IDENTIFIER;

                // Store generated inverser in inversers array
                let inverser = {
                    x: x,
                    y: y,
                };
                this.inversers.push(inverser);
                count++;
            }
        }
        return this.inversers;
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