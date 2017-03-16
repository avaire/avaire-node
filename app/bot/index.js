module.exports = {
    commands: require('./commands'),
    handlers: require('./HandlerRegistry'),
    statistics: require('./RuntimeStatistics'),
    middleware: require('./MiddlewareRegistry'),
    permissions: require('./PermissionRegistry')
};
