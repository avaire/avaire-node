/** @ignore */
const Knex = require('knex');
/** @ignore */
var Cache = null;
/** @ignore */
const GuildTransformer = require('./transformers/GuildTransformer');

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
            }
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

    getGuild(guildId) {
        let token = `database.${guildId}`;

        if (Cache.has(token)) {
            return new Promise(function (resolve) {
                resolve(Cache.get(token));
            });
        }

        return new Promise((resolve, reject) => {
            this.getClient().select().from(app.constants.GUILD_TABLE_NAME)
                .where('id', guildId)
                .then(response => {
                    app.bot.statistics.databaseQueries++;

                    if (response.length <= 0) {
                        let guild = bot.Guilds.filter(item => {
                            return item.id === guildId;
                        });

                        if (guild.length <= 0) {
                            return reject(`Faild to find a guild the bot is connected to with an ID of ${guildId}`);
                        }

                        guild = guild[0];
                        Cache.put(token, new GuildTransformer({
                            id: guild.id,
                            owner: guild.owner_id,
                            name: guild.name
                        }), 5);

                        this.insert(app.constants.GUILD_TABLE_NAME, {
                            id: guild.id,
                            owner: guild.owner_id,
                            name: guild.name
                        });
                    } else {
                        Cache.put(token, new GuildTransformer(response[0]), 5);
                    }

                    resolve(Cache.get(token));
                }).catch(function (err) {
                    return reject(err);
                }
            );
        });
    }

    insert(table, fields, timestamps = true) {
        if (timestamps) {
            fields.created_at = new Date;
            fields.updated_at = new Date;
        }

        this.getClient().insert(fields).into(table)
            .then(() => {
                app.bot.statistics.databaseQueries++;
            }).catch(err => {
                app.logger.error(err);
            });
    }
}

module.exports = Database;
