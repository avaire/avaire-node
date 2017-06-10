/** @ignore */
const moment = require('moment');
/** @ignore */
const ShardTransformer = require('../transformers/ShardTransformer');
/** @ignore */
const Job = require('./../../bot/jobs/Job');

/**
 * Sync Shard Data Job, this job runs every two minutes, everytime
 * it runs it will query and select everything from the shards
 * table that has been updated in the last 5 minutes, and
 * store it in the cache so it can be used later.
 *
 * @extends {Job}
 */
class SyncShardDataJob extends Job {

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
        return '*/2 * * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        return this.buildSelectQuery().then(result => {
            app.bot.statistics.databaseQueries++;

            let shards = [];
            for (let i in result) {
                shards.push(new ShardTransformer(result[i]));
            }

            app.cache.forever('database.shards', shards, 'memory');
        });
    }

    /**
     * Builds the select query for the Shards table, the query will only
     * return records that has been updated in the last 5 minutes, this
     * will remove inactive or broken shards from the returned result.
     *
     * @return {Promise}
     */
    buildSelectQuery() {
        return app.database.getClient()
                           .select()
                           .from(app.constants.SHARD_TABLE_NAME)
                           .where('updated_at', '>', moment(new Date).subtract(10, 'minutes').toDate());
    }
}

module.exports = SyncShardDataJob;
