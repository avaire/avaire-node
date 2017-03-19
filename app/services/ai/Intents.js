module.exports = {
    'input.unknown': {
        intent: 'What?',
        handler: require('./intents/Unknown')
    },
    'request.online-players': {
        intent: 'How many are online?',
        handler: require('./intents/RequestOnlinePlayers')
    }
};
