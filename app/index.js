module.exports = {
    bot: require('./bot'),

    // Utilities
    logger: require('./utils/logger/Logger'),
    cache: require('./utils/cache/CacheManager'),
    configLoader: require('./utils/config/ConfigLoader'),

    // Bot Version
    version: require('../package').version,
};
