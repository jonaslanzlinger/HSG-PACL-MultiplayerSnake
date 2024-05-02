const Empty = require("./Empty");

class Apple {

    static IDENTIFIER = 'a';

    // Stores positions of apples on map
    static apples = [];

    constructor() {
    }

    /**
     * Randomly generate valid apple coordinates on the map until numberOfApplesToBeGenerated is reached
     *
     * @param map
     * @param numberOfApplesToBeGenerated
     * @returns {*[]}
     */
    static generateApples(map, numberOfApplesToBeGenerated) {
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

    static handleSnakeConsumedApple(map, appleCoordinate) {
        map[appleCoordinate.x][appleCoordinate.y] = Empty.IDENTIFIER;

        // Remove the apple at given coordinates from array of available apples
        this.apples = this.apples.filter(function(apple) {
            return !(apple.x === appleCoordinate.x && apple.y === appleCoordinate.y);
        });

        // To compensate, generate a new apple at another position
        this.generateApples(map, 1)
    }
}

module.exports = Apple;