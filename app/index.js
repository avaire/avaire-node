module.exports = {
    bot: require('./bot'),

    // Utilities
    logger: require('./utils/logger/Logger'),
    cache: require('./utils/cache/CacheManager'),
    throttle: require('./utils/throttle/Throttle'),
    scheduler: require('./utils/scheduler/Scheduler'),
    configLoader: require('./utils/config/ConfigLoader'),

    // Bot Version
    version: require('../package').version,
};
