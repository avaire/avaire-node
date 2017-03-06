module.exports = {
    // Utilities
    logger: require('./utils/logger/Logger'),
    configLoader: require('./utils/config/ConfigLoader'),

    // Bot Version
    version: require('../package').version,
};
