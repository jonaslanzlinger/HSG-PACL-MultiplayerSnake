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
        //Denotes the maximum number of stars allowed on the map
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
     * Inverse the movement of other players until timeout is reached.
     *
     * @param castingPlayer is the snake activating the powerup.
     * @param players is the current list of players that are affected by the powerup
     */
    // static activatePowerUp(castingPlayer, players) {
    //     castingPlayer.isPowerUpActive = true;

    //     //Add the inverser debuff to all other players
    //     players.filter(player => player.socket.id !== castingPlayer.socket.id)
    //         .forEach(player => {
    //             player.activeDebuffs.push(Inverser.IDENTIFIER);
    //         });

    //     // Stop powerup effect after specified time
    //     setTimeout(() => {
    //         castingPlayer.isPowerUpActive = false;
    //         castingPlayer.activePowerUp = null;

    //         // For each player, remove the first occurrence of the debuff in the list of activeDebuffs of the opponent
    //         players.filter(player => player.socket.id !== castingPlayer.socket.id)
    //             .forEach(player => {
    //                 // Note that because we only remove the first occurrence, it is possible to stack multiple debuffs that have their own setTimeout until they expire
    //                 let firstDebuffOccurrence = player.activeDebuffs.indexOf(Inverser.IDENTIFIER);
    //                 if (firstDebuffOccurrence !== -1) {
    //                     player.activeDebuffs.splice(firstDebuffOccurrence, 1);
    //                 }
    //             });
    //     }, BackendConfig.POWERUPS.INVERSER.EFFECT.INVERSE_OTHER_PLAYERS_MOVEMENT_MS);
    // }

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