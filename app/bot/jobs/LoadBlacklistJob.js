/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

/**
 * Inactive Voice Stream job, this job runs every minute, every cycle the job will
 * go through all the voice connections and make sure they're still active and
 * being used(atleast one person is listening to the music), if no one is
 * listening and it's been too long the connection will be droped.
 *
 * @extends {Job}
 */
class InactiveVoiceStreamJob extends Job {

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
        return app.database.getBlacklist().then(users => {
            let feature = app.bot.features.blacklist;

            feature.blacklist = users;
        }).catch(err => app.logger.error(err));
    }
}

module.exports = InactiveVoiceStreamJob;
