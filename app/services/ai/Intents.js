module.exports = {
    'input.unknown': {
        intent: 'What?',
        handler: require('./intents/Unknown')
    },
    'request.online-players': {
        intent: 'How many are online?',
        handler: require('./intents/RequestOnlinePlayers')
    },
    'request.cat': {
        intent: 'Random cat',
        handler: require('./intents/RequestCat')
    },
    'request.dog': {
        intent: 'Random dog',
        handler: require('./intents/RequestDog')
    },
    'request.level': {
        intent: 'Request Level',
        handler: require('./intents/RequestLevel')
    },
    'request.song': {
        intent: 'Find song',
        handler: require('./intents/FindSong')
    },
    'command.prefix': {
        intent: 'Command Prefix',
        handler: require('./intents/CommandPrefix')
    }
};
