/** @ignore */
const cron = require('node-schedule');
/** @ignore */
const Task = require('./Task');

/**
 * Task and cronjob scheduler, allows you to run closures
 * on a delay, or closures to repeat themselves on a delay.
 */
class Scheduler {

    /**
     * Registeres a cronjob task.
     *
     * @param  {Job} job  The job that should be registered
     * @return {CronJob}
     */
    registerJob(job) {
        let rule = new cron.RecurrenceRule();

        return cron.scheduleJob(job.runCondition(rule), () => {
            job.run();
        });
    }

    /**
     * Schedules a repeating task.
     *
     * @param  {Closure} closure         The closure/callback that should be called
     * @param  {Integer} delay           The delay before the repeating task begins
     * @param  {Integer} repeatingDelay  The interval between repeating tasks
     * @return {Task}
     */
    scheduleRepeatingTask(closure, delay, repeatingDelay) {
        return this.createTask(closure, delay, repeatingDelay).start();
    }

    /**
     * Schedules a delayed task.
     *
     * @param  {Closure} closure  The closure/callback that should be called
     * @param  {Integer} delay    The delay before the task should be invoked
     * @return {Task}
     */
    scheduleDelayedTask(closure, delay) {
        return this.createTask(closure, delay).start();
    }

    /**
     * Creates and prepares the task instances.
     *
     * @param  {Closure} closure         The closure/callback that should be used in the task
     * @param  {Integer} delay           The delay before the task should be invoked
     * @param  {Integer} repeatingDelay  The delay before the task should repeat itself
     * @return {Task}
     */
    createTask(closure, delay, repeatingDelay) {
        return new Task(closure, delay, repeatingDelay);
    }
}

module.exports = new Scheduler;
