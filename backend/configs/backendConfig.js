'use strict';

const BackendConfig = {
    FPS: 10,
    MAP_SIZE: 60,
    SNAKE_SPAWN_LENGTH: 3, // default length of the snake when it spawns
    SNAKE_SPAWN_DIRECTION: 'd', //default direction the snake moves when it spawns
    NUMBER_OF_FIELDS: { //the number of fields to be generated on the map
        APPLE: 20,
        OBSTACLE: 30,
    }
}

module.exports = BackendConfig;