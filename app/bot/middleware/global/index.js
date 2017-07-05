module.exports = {
    maintenance: require('./MaintenanceMiddleware'),
    module: require('./ModuleStatusMiddleware'),
    canSendMessages: require('./CanSendMessagesMiddleware')
};
