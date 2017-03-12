/**
 * The "abstract" job class, the entire class just work as a palceholder
 * for propper jobs until logic for the handler(run method) is filled out.
 *
 * @abstract
 */
class Job {

    /**
     * This method determines when the job should be execcuted.
     *
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return rule;
    }

    /**
     * The jobs main logic method, this method executed
     * whenever the {@link Job#runCondition} method returns true.
     */
    run() {
        //
    }
}

module.exports = Job;
