module.exports = {
    bot: require('./bot'),
    constants: require('./constants'),
    service: require('./services'),

    // Utilities
    lang: require('./utils/lang/Language'),
    logger: require('./utils/logger/Logger'),
    envoyer: require('./utils/envoyer/Envoyer'),
    cache: require('./utils/cache/CacheManager'),
    throttle: require('./utils/throttle/Throttle'),
    scheduler: require('./utils/scheduler/Scheduler'),
    configLoader: require('./utils/config/ConfigLoader'),

    // Bot Version
    version: require('../package').version
};
