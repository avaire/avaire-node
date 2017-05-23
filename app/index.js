module.exports = {
    bot: require('./bot'),
    constants: require('./constants'),
    service: require('./services'),

    // Utilities
    lang: require('./utils/lang/Language'),
    logger: require('./utils/logger/Logger'),
    process: require('./utils/process/Process'),
    envoyer: require('./utils/envoyer/Envoyer'),
    cache: require('./utils/cache/CacheManager'),
    throttle: require('./utils/throttle/Throttle'),
    scheduler: require('./utils/scheduler/Scheduler'),
    permission: require('./utils/permission/Permission'),
    configLoader: require('./utils/config/ConfigLoader'),

    // Bot Version
    version: require('../package').version,
    runTime: new Date().getTime()
};
