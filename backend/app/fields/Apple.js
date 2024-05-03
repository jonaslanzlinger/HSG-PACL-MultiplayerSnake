const Empty = require("./Empty");
const BackendConfig = require("../../configs/backendConfig");

class Apple {

    static IDENTIFIER = BackendConfig.FIELDS.APPLE.IDENTIFIER;

    // Stores positions of apples on map
    static apples = [];

    // Though the SPAWN_CHANCE_PER_SECOND denotes the percentage per second, the actual tick rate of the game
    // is 1000 / FPS, so we have to calculate the chance per tick.
    static SPAWN_CHANCE_PER_TICK = BackendConfig.FIELDS.APPLE.SPAWN_CHANCE_PER_SECOND / BackendConfig.FPS;


    constructor() {
    }

    /**
     * Randomly generate valid apple coordinates on the map until numberOfApplesToBeGenerated is reached
     *
     * @param map
     * @param numberOfApplesToBeGenerated
     * @returns {*[]}
     */
    static generateFixNumberOfApples(map, numberOfApplesToBeGenerated) {
        // Until we reach the desired number of newly generated fields, select a random field on the map and try to change it into the new field
        let count = 0;
        while (count < numberOfApplesToBeGenerated) {
            // Generate random map field coordinates
            const x = Math.floor(Math.random() * map.length);
            const y = Math.floor(Math.random() * map[0].length);

            // Check if the field is empty
            if (map[x][y] === Empty.IDENTIFIER) {
                // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
                map[x][y] = Apple.IDENTIFIER;

                // Store generated apple in apples array
                let apple = {
                    x: x,
                    y: y,
                };
                this.apples.push(apple);
                count++;
            }
        }
        return this.apples;
    }

    /**
     * Randomly generate valid apple coordinates while reflecting the desired SPAWN_CHANCE
     *
     * @param map
     * @returns {*[]}
     */
    static generateApples(map) {
        //Denotes the maximum number of apples allowed on the map
        const maxApplesReached = this.apples.length >= BackendConfig.FIELDS.APPLE.MAX_ON_MAP;

        // Only generate apples at a rate that resembles the defined SPAWN_CHANCE
        if (!maxApplesReached && Math.random() < this.SPAWN_CHANCE_PER_TICK) {
            // Generate random map field coordinates
            const x = Math.floor(Math.random() * map.length);
            const y = Math.floor(Math.random() * map[0].length);

            // Check if the field is empty
            //TODO: in addition to the random check, we do not account for the random field to be occupied (which further decreases the chance), but I guess we could argue that this is a self-adjusting mechanism because as the map is filled with junk, the smaller the chance that there actually spawns even more.
            if (map[x][y] === Empty.IDENTIFIER) {
                // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
                map[x][y] = Apple.IDENTIFIER;

                // Store generated apple in apples array
                let apple = {
                    x: x,
                    y: y,
                };
                this.apples.push(apple);
            }
        }
    }

    static handleSnakeConsumedApple(map, appleCoordinate) {
        map[appleCoordinate.x][appleCoordinate.y] = Empty.IDENTIFIER;

        // Remove the apple at given coordinates from array of available apples
        this.apples = this.apples.filter(function(apple) {
            return !(apple.x === appleCoordinate.x && apple.y === appleCoordinate.y);
        });
    }
}

module.exports = Apple;