/** @ignore */
const ShardTransformer = require('../transformers/ShardTransformer');
/** @ignore */
const Job = require('./../../bot/jobs/Job');

/**
 * Update Shard Data Job, this job will run every minute, updating the database
 * shard table with the bot instances current stats, the stats are then pulled
 * down via the SyncShardDataJob to give easy access to all shard information
 * and their statuses between all instances of the bot.
 *
 * @extends {Job}
 */
class UpdateShardDataJob extends Job {

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
        return '* * * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        let shard = new ShardTransformer;

        this.getShardFromId().then(result => {
            if (result.length === 0) {
                return app.database.insert(app.constants.SHARD_TABLE_NAME, shard.toDatabaseBindings());
            }

            return app.database.update(app.constants.SHARD_TABLE_NAME, shard.toDatabaseBindings(),
                query => query.where('id', app.shard.getId()));
        }).catch(err => app.logger.error(err));
    }

    /**
     * Selects the database record that matches with the current shard id.
     *
     * @return {Promise}
     */
    getShardFromId() {
        return app.database.getClient()
                           .select()
                           .from(app.constants.SHARD_TABLE_NAME)
                           .where('id', app.shard.getId());
    }
}

module.exports = UpdateShardDataJob;
