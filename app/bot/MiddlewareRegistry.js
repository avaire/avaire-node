module.exports = {
    isBotAdmin: require('./middleware/IsBotAdmin'),
    require: require('./middleware/Require'),
    hasRole: require('./middleware/HasRole'),
    'require.user': require('./middleware/RequireUser'),
    'throttle.user': require('./middleware/ThrottleUser'),
    'throttle.channel': require('./middleware/ThrottleChannel'),
    'throttle.guild': require('./middleware/ThrottleGuild')
};
