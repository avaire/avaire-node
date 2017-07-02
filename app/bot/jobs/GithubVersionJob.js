/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Github version job, this job runs once an hour, every cycle the
 * job will fetch the latest version number of AvaIre from the
 * public github repository and store them in the file cache.
 *
 * @extends {Job}
 */
class GithubVersionJob extends Job {

    /**
     * The jobs constructor, this will check if the cache
     * already exists, if it doesn't it will create
     * it by calling the run method.
     */
    constructor() {
        super();

        if (!app.cache.has('github.version')) {
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
        return '30 * * * *';
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
            url: 'https://raw.githubusercontent.com/Senither/AvaIre/master/package.json',
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    if (typeof parsed.version === 'undefined') {
                        return app.logger.error('Github Version Job: Attempted to fetch github version but json response returned an invliad package object');
                    }

                    app.cache.forever('github.version', parsed.version);
                } catch (err) {
                    app.logger.raven(error, {
                        message: `Github Version Job: The API returned an unconventional response.`,
                        body
                    });
                }
            }
        });
    }
}

module.exports = GithubVersionJob;
