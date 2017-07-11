/** @ignore */
const _ = require('lodash');
/** @ignore */
const directory = require('require-directory');
/** @ignore */
const ServerLogger = require('./ServerLogger');

/**
 * Shard manager, helps get a quick overview of how many
 * servers, users, and channels the bot is in, it is
 * also used to sync data between shards.
 */
class ShardManager {

    /**
     * Setups up and prepares the shard manager.
     */
    constructor() {
        /**
         * Determins if the bot instance is started in a sharded mode.
         *
         * @type {Boolean}
         */
        this.isUsingShards = bot.options.hasOwnProperty('shardId') &&
                             bot.options.hasOwnProperty('shardCount');
    }

    /**
     * Returns the server logger instance.
     *
     * @return {ServerLogger}
     */
    get logger() {
        return ServerLogger;
    }

    /**
     * Registers jobs associated with the shard manager.
     */
    registerJobs() {
        _.each(directory(module, './jobs'), (Job, key) => {
            app.bot.jobs[key] = app.scheduler.registerJob(new Job);
        });
    }

    /**
     * Returns true if sharding for the current bot
     * instance is enabled, false otherwise.
     *
     * @return {Boolean}
     */
    isEnabled() {
        return this.isUsingShards;
    }

    /**
     * Gets the Shard ID, if the bot is not in a sharded
     * mode the method will return 0 by default.
     *
     * @return {Number}
     */
    getId() {
        return this.isUsingShards ? bot.options.shardId : 0;
    }

    /**
     * Gets the Shard Count, if the bot is not in a sharded
     * mode the method will return 1 by default.
     *
     * @return {Number}
     */
    getCount() {
        return this.isUsingShards ? bot.options.shardCount : 1;
    }

    /**
     * Gets the total number of users the bot knows about between all
     * the shards the bot has, if the bot is not in a sharded mode
     * the users for the current user will be returned instead.
     *
     * @return {Number}
     */
    getUsers() {
        return this.getCountedProperty('users', () => bot.Users.length);
    }

    /**
     * Gets the total number of guilds the bot knows about between all
     * the shards the bot has, if the bot is not in a sharded mode
     * the guilds for the current user will be returned instead.
     *
     * @return {Number}
     */
    getGuilds() {
        return this.getCountedProperty('guilds', () => bot.Guilds.length);
    }

    /**
     * Gets the total number of channels the bot knows about between all
     * the shards the bot has, if the bot is not in a sharded mode the
     * channels for the current user will be returned instead.
     *
     * @return {Number}
     */
    getChannels() {
        return this.getCountedProperty('channels', () => bot.Channels.length);
    }

    /**
     * Counts the given property for the sharded bot instances.
     *
     * @param  {String}    property  The property that should be counted
     * @param  {Function}  fallback  The fallback method if the bot is not in a sharded mode.
     * @return {Number}
     */
    getCountedProperty(property, fallback) {
        if (!this.isUsingShards) {
            return fallback();
        }

        let properties = 0;
        let shards = this.getShards();
        for (let i in shards) {
            properties += shards[i].get(property, 0);
        }

        return properties;
    }

    /**
     * Gets an array of shard transformers for all
     * valid shard records from the database.
     *
     * @return {Array}
     */
    getShards() {
        return app.cache.get('database.shards', [], 'memory');
    }
}

module.exports = ShardManager;
