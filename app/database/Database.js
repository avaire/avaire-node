/** @ignore */
const Knex = require('knex');
/** @ignore */
const emojiStrip = require('emoji-strip');
/** @ignore */
let Cache = null;
/** @ignore */
const UserTransformer = require('./transformers/UserTransformer');
/** @ignore */
const GuildTransformer = require('./transformers/GuildTransformer');
/** @ignore */
const PlaylistTransformer = require('./transformers/PlaylistTransformer');
/** @ignore */
const ChannelsHandler = require('./../bot/handlers/utils/UpdateGuildChannelsHandler');

/**
 * Database manager class, this class allows you to interact with
 * different database types as well as fetching guild, channel
 * and user data easily from the database.
 *
 * @see http://knexjs.org/
 */
class Database {

    /**
     * Setups the Knex database instance of the
     * provided type from the config.json file.
     */
    constructor() {
        Cache = app.cache.resolveAdapter('memory');

        /**
         * The Knex client database instance.
         *
         * @type {Knex}
         */
        this.client = new Knex({
            client: app.config.database.type,
            connection: app.config.database,
            pool: {
                min: 2,
                max: 18
            },
            migrations: {
                tableName: 'migrations',
                directory: './app/database/migrations'
            },
            useNullAsDefault: true
        });
    }

    /**
     * Runs the database migrations.
     *
     * @return {Promise}
     */
    runMigrations() {
        return new Promise((resolve, reject) => {
            this.getClient().migrate.latest().then(() => {
                resolve();
            }).catch(err => {
                app.logger.error(err);
                reject(err);
            });
        });
    }

    /**
     * Gets the Knex database client instance.
     *
     * @return {Knex}
     */
    getClient() {
        return this.client;
    }

    /**
     * Gets the guild with the provided id.
     *
     * @param  {String}   guildId    The id of the guild that should fetched.
     * @param  {Boolean}  skipCache  Determines if the cache should be used if is valid.
     * @return {Promise}
     */
    getGuild(guildId, skipCache = false) {
        let token = `database.${guildId}`;

        // If we shouldn't skip the cache and the cache already has a version of the guild
        // stored, we'll just fetch that and return it without hitting the database.
        if (!skipCache && Cache.has(token)) {
            return new Promise(resolve => {
                resolve(Cache.get(token));
            });
        }

        // Sets up the promise and fetches the database guild record from the database.
        return new Promise((resolve, reject) => {
            let guild = bot.Guilds.find(item => item.id === guildId);

            if (typeof guild === 'undefined' || guild === null) {
                return reject(new Error(`Faild to find a guild the bot is connected to with an ID of ${guildId}`));
            }

            // If we don't have the guilds data stored in the cache we'll create a temporary fake guild
            // cache so any requests for the guild that might come in right after won't attempt to
            // create multiple rows if the guild doesn't already have a row in the database.
            if (!Cache.has(token)) {
                this.fakeGuildData(token, app.getGuildIdFrom(guild), guild.owner_id, guild.name);
            }

            this.getClient().select().from(app.constants.GUILD_TABLE_NAME)
                .where('id', guildId)
                .then(response => {
                    app.bot.statistics.databaseQueries++;

                    // If the query didn't return any valid data we'll try and find the guild in
                    // the list of guilds that Ava is connected to and setup a default guild
                    // transformer, as well as inserting a new record into the database
                    // so we can find the guild on the next call to the database.
                    if (response.length <= 0) {
                        // Sets up our default guild transformer and stores it in the cache for 5 minutes.
                        Cache.put(token, new GuildTransformer({
                            id: app.getGuildIdFrom(guild),
                            owner: guild.owner_id,
                            name: this.stringifyEmojis(guild.name),
                            icon: guild.icon
                        }), 500);

                        let channels = ChannelsHandler.getChannels(guild);

                        this.insert(app.constants.GUILD_TABLE_NAME, {
                            id: app.getGuildIdFrom(guild),
                            owner: guild.owner_id,
                            name: this.stringifyEmojis(guild.name),
                            icon: guild.icon,
                            channels_data: JSON.stringify(channels)
                        }).catch(err => {
                            return app.logger.error('Failed to insert database record ', err, '\nchannels: ', channels);
                        });
                    } else {
                        Cache.put(token, new GuildTransformer(response[0]), 500);
                    }

                    // Resolves the guild transformer from the cache.
                    resolve(Cache.get(token));
                }).catch(err => {
                    return reject(err);
                }
            );
        });
    }

    /**
     * Gets the playlists for the given guild id.
     *
     * @param  {String}   guildId    The id of the guild that should have its playlists fetched.
     * @param  {Boolean}  skipCache  Determines if the cache should be used if it is valid.
     * @return {Promise}
     */
    getPlaylist(guildId, skipCache = false) {
        let token = `database-playlist.${guildId}`;

        // If we shouldn't skip the cache and the cache already has a version of the guild
        // stored, we'll just fetch that and return it without hitting the database.
        if (!skipCache && Cache.has(token)) {
            return new Promise(resolve => {
                resolve(Cache.get(token));
            });
        }

        return new Promise((resolve, reject) => {
            app.bot.statistics.databaseQueries++;

            this.getClient().select().from(app.constants.PLAYLIST_TABLE_NAME)
                .where('guild_id', guildId)
                .then(databaseResponse => {
                    let response = [];
                    for (let i in databaseResponse) {
                        response.push(new PlaylistTransformer(databaseResponse[i]));
                    }

                    // Stores the responses array in the cache for the next 5 minutes.
                    Cache.put(token, response, 300);

                    // Resolves the playlist from cache.
                    return resolve(Cache.get(token));
                }).catch(err => {
                    return reject(err);
                });
        });
    }

    /**
     * Gets the user database transformer.
     *
     * @param  {String}   guildId    The guild the user should be fetched for.
     * @param  {IUser}    user       The user that should be have their data fetched from the database.
     * @param  {Boolean}  skipCache  Determines if the cache should be used if is valid.
     * @return {UserTransformer}
     */
    getUser(guildId, user, skipCache = false) {
        let token = `database-user.${guildId}.${user.id}`;

        // If we shouldn't skip the cache and the cache already has a version of the guild
        // stored, we'll just fetch that and return it without hitting the database.
        if (!skipCache && Cache.has(token)) {
            return new Promise(resolve => {
                resolve(Cache.get(token));
            });
        }

        return new Promise((resolve, reject) => {
            this.getClient().select().from(app.constants.USER_EXPERIENCE_TABLE_NAME)
                .where('user_id', user.id).andWhere('guild_id', guildId)
                .then(response => {
                    app.bot.statistics.databaseQueries++;

                    // If the query didn't return any valid data we'll try and find the guild in
                    // the list of guilds that Ava is connected to and setup a default guild
                    // transformer, as well as inserting a new record into the database
                    // so we can find the guild on the next call to the database.
                    if (response.length <= 0) {
                        let bindings = {
                            user_id: user.id,
                            guild_id: guildId,
                            username: this.stringifyEmojis(user.username),
                            discriminator: user.discriminator,
                            avatar: user.avatar,
                            experience: 100
                        };

                        // Sets up our default user transformer and stores it in the cache for 10 minutes.
                        Cache.put(token, new UserTransformer(bindings), 600);

                        this.insert(app.constants.USER_EXPERIENCE_TABLE_NAME, bindings)
                            .catch(err => reject(err));
                    } else {
                        Cache.put(token, new UserTransformer(response[0]), 600);
                    }

                    // Resolves the guild transformer from the cache.
                    resolve(Cache.get(token));
                }).catch(err => reject(err));
        });
    }

    /**
     * Gets the database bot blacklist, any users returned from this query
     * will be prevented from using any features within the bot.
     *
     * @return {Promise}
     */
    getBlacklist() {
        return new Promise((resolve, reject) => {
            app.bot.statistics.databaseQueries++;

            return this.getClient().select().from(app.constants.BLACKLIST_TABLE_NAME)
                        .then(response => resolve(response))
                        .catch(err => reject(err));
        });
    }

    /**
     * Inserts a new record into the provided table with the provided fields,
     * if timestamps is set to true a created_at and updated_at field will
     * be added to the fields object with the current date as their value.
     *
     * @param  {String}  table       The name of the table the record should be inserted into.
     * @param  {Object}  fields      The fields that should populate the row.
     * @param  {Boolean} timestamps  Determines if the record uses timestamps, defaults to true.
     * @return {Promise}
     */
    insert(table, fields, timestamps = true) {
        return new Promise((resolve, reject) => {
            if (timestamps) {
                fields.created_at = new Date;
                fields.updated_at = new Date;
            }

            return this.getClient().insert(fields).into(table).then(() => {
                app.bot.statistics.databaseQueries++;

                return resolve();
            }).catch(err => {
                app.logger.error(err);

                return reject(err);
            });
        });
    }

    /**
     * Updates an existing record in the database that satisfies the
     * provided condition, if no condition is given every record
     * in the database will be updated to the new values.
     *
     * @param  {String}  table       The name of the table that holds the database records.
     * @param  {Object}  fields      The fields that should be updated in the database records.
     * @param  {Closure} condition   The closure that should limit the query.
     * @param  {Boolean} timestamps  Determins if the record uses timestatmps, defaults to true.
     * @return {Promise}
     */
    update(table, fields, condition, timestamps = true) {
        return new Promise((resolve, reject) => {
            if (timestamps) {
                fields.updated_at = new Date;
            }

            let query = this.getClient().table(table).update(fields);
            if (typeof condition === 'function') {
                query = condition(query);
            }

            return query.then(() => {
                return resolve(app.bot.statistics.databaseQueries++);
            }).catch(err => app.logger.error(err));
        });
    }

    /**
     * Creates a temporary fake guild data cache, lasting for 5 seconds.
     *
     * @param  {String}  token  The token that the cache should be stored under.
     * @param  {String}  id     The ID of the guild.
     * @param  {String}  owner  The ID of the owner of the guild.
     * @param  {String}  name   The name of the guild.
     * @return {Boolean}
     */
    fakeGuildData(token, id, owner, name) {
        return Cache.put(token, new GuildTransformer({
            id, owner, name
        }), 5);
    }

    /**
     * Stringify a string by removing emojis from it,
     * allowing it to be stored in the database.
     *
     * @param  {String}  string  The string that should be stringified.
     * @return {String|null}
     */
    stringifyEmojis(string) {
        let striped = emojiStrip(string);

        return striped.trim() === 0 ? null : striped;
    }
}

module.exports = Database;
