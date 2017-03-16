module.exports = {
    isBotAdmin: require('./middleware/IsBotAdmin'),
    require: require('./middleware/Require'),
    'throttle.user': require('./middleware/ThrottleUser'),
    'throttle.channel': require('./middleware/ThrottleChannel'),
    'throttle.guild': require('./middleware/ThrottleGuild')
};
