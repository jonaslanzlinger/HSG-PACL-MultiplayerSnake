'use strict';

const SocketConfig = {
    PORT: 1337,
    EVENTS: {
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        JOIN_GAME: 'joinGame',
        PLAYER_NUMBER: 'playerNumber',
        USER_INPUT: 'userInput',
        GAME_STATE: 'gameState',
        GAME_OVER: 'gameOver',
        FORCE_DISCONNECT: 'forceDisconnect',
        CHAT: 'chat',
        CHAT_TO_FRONTENT: 'chatToFrontend'
    }
}

module.exports = SocketConfig;