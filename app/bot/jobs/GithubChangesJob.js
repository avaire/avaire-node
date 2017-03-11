/** @ignore */
const Job = require('./job');
/** @ignore */
const request = require('request');

class GithubChangeJob extends Job {

    /**
     * This method determines when the job should be execcuted.
     * 
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return '*/15 * * * *';
    }

    /**
     * The jobs main logic method, this method is executed 
     * whenever the {#runCondition()} method returns true.
     * 
     * @override
     */
    run() {
        request({
            headers: { 'User-Agent': 'AvaIre-Discord-Bot' },
            url: 'https://api.github.com/repos/senither/AvaIre/commits',
            method: 'GET'
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);
                    
                    app.cache.forever('github.commits', parsed);
                } catch (e) {
                    app.logger.error('Github Changes job: The API returned an unconventional response.');
                    app.logger.error(e);
                }
            }
        })
    }
}

module.exports = GithubChangeJob;
