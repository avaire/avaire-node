module.exports = {
    bot: require('./bot'),
    constants: require('./constants'),
    service: require('./services'),

    // Utilities
    role: require('./utils/role/Role'),
    guild: require('./utils/guild/Guild'),
    lang: require('./utils/lang/Language'),
    time: require('./utils/time/TimeParser'),
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
    runTime: new Date().getTime(),

    // Quick helper function for the guild utility
    getGuildIdFrom: context => app.guild.getIdFrom(context),
    loadProperty: (context, properties) => app.process.getProperty(context, properties)
};
