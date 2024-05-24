const Empty = require("../Empty");
const BackendConfig = require("../../../configs/backendConfig");

class Inverser {

    static IDENTIFIER = BackendConfig.POWERUPS.INVERSER.IDENTIFIER;

    // Stores positions of inverser on map
    static inversers = [];

    // Though the SPAWN_CHANCE_PER_SECOND denotes the percentage per second, the actual tick rate of the game
    // is 1000 / FPS, so we have to calculate the chance per tick.
    static SPAWN_CHANCE_PER_TICK = BackendConfig.POWERUPS.INVERSER.SPAWN_CHANCE_PER_SECOND / BackendConfig.FPS;

    constructor() { }

    /**
     * Randomly generate valid inverser coordinates while reflecting the desired SPAWN_CHANCE
     *
     * @param map
     * @returns {*[]}
     */
    static generateInversers(map) {
        // Denotes the maximum number of stars allowed on the map
        const maxInversersReached = this.inversers.length >= BackendConfig.POWERUPS.INVERSER.MAX_ON_MAP;

        // Only generate stars at a rate that resembles the defined SPAWN_CHANCE
        if (!maxInversersReached && Math.random() < this.SPAWN_CHANCE_PER_TICK) {
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

    /**
     * Handle the consumption of an inverser by a snake.
     * The inverser is removed from the map and the powerup is added to the inventory of the snake.
     * 
     * @param map is the current map of the game
     * @param inverserCoordinate is the coordinate of the inverser that is consumed
     * @param powerUpInventory is the inventory of the snake that consumes the inverser
     * @returns void
     */
    static handleSnakeConsumedInverser(map, inverserCoordinate, powerUpInventory) {
        // After consumption, the field cell is back to normal
        map[inverserCoordinate.x][inverserCoordinate.y] = Empty.IDENTIFIER;

        // Remove the inverser at given coordinates from array of available inversers
        this.inversers = this.inversers.filter(function (inverser) {
            return !(inverser.x === inverserCoordinate.x && inverser.y === inverserCoordinate.y);
        });

        // Add PowerUp to inventory of player
        powerUpInventory.push(Inverser.IDENTIFIER);
    }

    /**
     * Activate the inverser powerup for a player.
     * The player is given the inverser powerup for a certain duration.
     * 
     * @param player is the player that consumes the inverser
     * @param allPlayers is the array of all players in the game
     * @returns void
     */
    static activatePowerUp(player, allPlayers) {
        player.activePowerUps.push(Inverser.IDENTIFIER);
        setTimeout(() => {
            let firstPowerUpOccurrence = player.activePowerUps.indexOf(Inverser.IDENTIFIER);
            if (firstPowerUpOccurrence !== -1) {
                player.activePowerUps.splice(firstPowerUpOccurrence, 1);
            }
            // Remove the inverser debuff from all other players
            allPlayers.filter(otherPlayer => otherPlayer.socket.id !== player.socket.id)
                .forEach(otherPlayer => {
                    let firstDebuffOccurrence = otherPlayer.activeDebuffs.indexOf(Inverser.IDENTIFIER);
                    if (firstDebuffOccurrence !== -1) {
                        otherPlayer.activeDebuffs.splice(firstDebuffOccurrence, 1);
                    }
                });
        }, BackendConfig.POWERUPS.INVERSER.DURATION);

        // Add the inverser debuff to all other players
        allPlayers.filter(otherPlayer => otherPlayer.socket.id !== player.socket.id)
            .forEach(otherPlayer => {
                otherPlayer.activeDebuffs.push(Inverser.IDENTIFIER);
            });
    }
}

module.exports = Inverser;