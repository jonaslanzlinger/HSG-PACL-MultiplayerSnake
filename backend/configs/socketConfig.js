'use strict';

const SocketConfig = {
    PORT: 1337,
    EVENTS: {
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        JOIN_GAME: 'joinGame',
        USER_INPUT: 'userInput',
        GAME_STATE: 'gameState',
        GAME_OVER: 'gameOver',
    }
}

module.exports = SocketConfig;