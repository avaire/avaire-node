/** @ignore */
const GuildTypeTransformer = require('../../database/transformers/GuildTypeTransformer');
/** @ignore */
const Job = require('./Job');

/**
 * Sync Guild Type Job, fetches the guild types from the database and
 * stores them in the memory cache permantly, once every 30 minutes
 * they job will re-sync the database with the database to update
 * any changes that might've happened.
 *
 * @extends {Job}
 */
class SyncGuildTypesJob extends Job {

    /**
     * The jobs constructor, this will check if the cache
     * already exists, if it doesn't it will create
     * it by calling the run method.
     */
    constructor() {
        super();

        this.run();
    }

    /**
     * This method determines when the job should be execcuted.
     *
     * @override
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return '*/30 * * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        return app.database.getClient().select().from(app.constants.GUILD_TYPE_TABLE_NAME).then(result => {
            app.bot.statistics.databaseQueries++;

            let guildTypes = [];
            for (let i in result) {
                guildTypes.push(new GuildTypeTransformer(result[i]));
            }

            app.cache.forever('database.guild-types', guildTypes, 'memory');
        });
    }
}

module.exports = SyncGuildTypesJob;
