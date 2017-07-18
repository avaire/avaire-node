/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Reset Resoect Statistics Job, this job runs once a day at midnight, all
 * it really does it set the respects counter back to 0... That it
 *
 * @extends {Job}
 */
class ResetRespectStatisticsJob extends Job {

    /**
     * This method determines when the job should be execcuted.
     *
     * @override
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return '0 0 * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        app.bot.statistics.respects = 0;
    }
}

module.exports = ResetRespectStatisticsJob;
