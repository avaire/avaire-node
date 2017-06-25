/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Fetch Meme Types job, this job runs at 6 AM on wendays only, CEST,
 * every cycle the job will request the list of available meme types
 * from the MemeGenerator API and store them in the file cache.
 *
 * @extends {Job}
 */
class FetchMemeTypesJob extends Job {

    /**
     * The jobs constructor, this will check if the cache
     * already exists, if it doesn't it will create
     * it by calling the run method.
     */
    constructor() {
        super();

        this.templateUrl = 'https://memegen.link/api/templates/';

        if (!app.cache.has('meme.types')) {
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
        return '0 6 * * 3';
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
            url: this.templateUrl,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    let storeArray = [];
                    for (let name in parsed) {
                        storeArray.push({
                            trigger: parsed[name].substr(this.templateUrl.length, parsed[name].length), name
                        });
                    }

                    app.cache.forever('meme.types', storeArray);
                } catch (err) {
                    app.logger.error('Fetch Meme Types job: The API returned an unconventional response.');
                    app.logger.error(err);
                }
            }
        });
    }
}

module.exports = FetchMemeTypesJob;
