const Empty = require("../fields/Empty");

/**
 * Takes a map (2d array) and randomly generates fields of a given type until desired number of fields is reached
 *
 * @param map is the playing map to generate fields on
 * @param newFieldType is the field type to be generated on the given map
 * @param numberOfFieldsToBeGenerated is the number of fields to be randomly generated
 * @returns {*}
 */
const addRandomFieldsToMap = function (map, newFieldType, numberOfFieldsToBeGenerated) {
    // Until we reach the desired number of newly generated fields, select a random field on the map and try to change it into the new field
    let count = 0;
    while (count < numberOfFieldsToBeGenerated) {
        // Generate random indices
        const row = Math.floor(Math.random() * map.length);
        const col = Math.floor(Math.random() * map[0].length);

        // Check if the field is empty
        if (map[row][col] === Empty.IDENTIFIER) {
            map[row][col] = newFieldType;
            count++;
        }
    }
    return map;
}

module.exports = addRandomFieldsToMap;