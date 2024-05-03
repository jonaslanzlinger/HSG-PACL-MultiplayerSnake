const Empty = require("./Empty");
const BackendConfig = require("../../configs/backendConfig");

class Obstacle {

    static IDENTIFIER = BackendConfig.FIELDS.OBSTACLE.IDENTIFIER;

    // Stores positions of obstacles on map
    static obstacles = [];

    constructor() {
    }

    /**
     * Randomly generate valid obstacle coordinates on the map until numberOfObstaclesToBeGenerated is reached
     *
     * @param map
     * @param numberOfObstaclesToBeGenerated
     * @returns {*[]}
     */
    static generateObstacles(map, numberOfObstaclesToBeGenerated) {
        // Until we reach the desired number of newly generated fields, select a random field on the map and try to change it into the new field
        let count = 0;
        while (count < numberOfObstaclesToBeGenerated) {
            // Generate random map field coordinates
            const x = Math.floor(Math.random() * map.length);
            const y = Math.floor(Math.random() * map[0].length);

            // Check if the field is empty
            if (map[x][y] === Empty.IDENTIFIER) {
                // Although the map is regenerated right afterward, this ensures that a parallel generation of another field does not occupy the same coordinate
                map[x][y] = Obstacle.IDENTIFIER;

                //Store generated obstacle in obstacles array
                let obstacle = {
                    x: x,
                    y: y,
                };
                this.obstacles.push(obstacle);
                count++;
            }
        }
        return this.obstacles;
    }

}

module.exports = Obstacle;