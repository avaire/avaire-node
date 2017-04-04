module.exports = {
    commands: require('./commands'),
    features: require('./features'),
    handlers: require('./HandlerRegistry'),
    statistics: require('./RuntimeStatistics'),
    middleware: require('./MiddlewareRegistry'),
    permissions: require('./PermissionRegistry'),

    maintenance: false
};
