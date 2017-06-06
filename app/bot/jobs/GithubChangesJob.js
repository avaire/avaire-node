/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Github change job, this job runs once an hour, every cycle
 * the job will fetch the latest commits from the public
 * github repository and store them in the file cache.
 *
 * @extends {Job}
 */
class GithubChangeJob extends Job {

    /**
     * The jobs constructor, this will check if the cache
     * already exists, if it doesn't it will create
     * it by calling the run method.
     */
    constructor() {
        super();

        if (!app.cache.has('github.commits')) {
            this.run();
        }
    }

    /**
     * This method determines when the job should be execcuted.
     *
     * @override
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return '0 * * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        request({
            headers: {'User-Agent': `AvaIre-Discord-Bot (${bot.User.id})`},
            url: 'https://api.github.com/repos/AvaIre/AvaIre/commits',
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    app.cache.forever('github.commits', parsed);
                } catch (err) {
                    app.logger.error('Github Changes job: The API returned an unconventional response.');
                    app.logger.error(err);
                }
            }
        });
    }
}

module.exports = GithubChangeJob;
