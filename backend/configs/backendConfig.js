'use strict';

const BackendConfig = {
    FPS: 8,
    MAP_SIZE: 50,
    SNAKE_SPAWN_LENGTH: 3, // default length of the snake when it spawns
    SNAKE_SPAWN_DIRECTION: 'd', //default direction the snake moves when it spawns
    SNAKE_SPAWN_INVULNERABILITY_MS: 1000,
    NUMBER_OF_FIELDS: { //the number of fields to be generated on the map
        APPLE: 10,
        OBSTACLE: 20,
    }
}

module.exports = BackendConfig;