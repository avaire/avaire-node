/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Discord Bot Stats Update job, this job runs once every three hours of the bots
 * uptime, every cycle the job will send a HTTP POST request to the discord bot
 * stats services it uses, attempting to update the number of guilds the bot
 * has, if discord bot stats api service keys has beengiven the job will
 * cancel itself out before making the HTTP rquest.
 *
 * @extends {Job}
 */
class DiscordBotStatsUpdateJob extends Job {

    /**
     * The jobs constructor, this will check if the cache
     * already exists, if it doesn't it will create
     * it by calling the run method.
     */
    constructor() {
        super();

        this.statsServices = [
            {
                name: 'bots.discord.pw',
                host: 'https://bots.discord.pw/api/bots/:botid/stats'
            },
            {
                name: 'discordbots.org',
                host: 'https://discordbots.org/api/bots/:botid/stats'
            }
        ];
    }

    /**
     * This method determines when the job should be execcuted.
     *
     * @override
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return '0 */3 * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        let promise = null;

        for (let i in this.statsServices) {
            let service = this.statsServices[i];

            if (!app.config.apiKeys.hasOwnProperty(service.name)) {
                continue;
            }

            let authToken = app.config.apiKeys[service.name];
            if (typeof authToken !== 'string' || authToken.length === 0) {
                continue;
            }

            if (promise === null) {
                promise = this.sendRequest(service, authToken);
                continue;
            }

            promise.then(() => this.sendRequest());
        }
    }

    /**
     * Builds the request headers.
     *
     * @param  {String}  authToken  The auth token to authorize with the service APIs.
     * @return {Object}
     */
    buildHeaders(authToken) {
        return {
            'User-Agent': `Discord-Bot-${bot.User.id}`,
            'Content-Type': 'application/json',
            Authorization: authToken
        };
    }

    /**
     * Builds the service URL.
     *
     * @param  {String}  url  The service request url.
     * @return {String}
     */
    buildServiceUrl(url) {
        return url.replace(new RegExp(':botid', 'gm'), `${bot.User.id}`);
    }

    /**
     * Builds the request body.
     *
     * @return {Array}
     */
    buildRequestBody() {
        return {
            server_count: bot.Guilds.length
        };
    }

    /**
     * Sends the request to the service.
     *
     * @param  {Object}  service    The service object that should be used.
     * @param  {String}  authToken  The auth token for the given service.
     * @return {Promise}
     */
    sendRequest(service, authToken) {
        return new Promise((resolve, reject) => {
            request({
                json: true,
                method: 'POST',
                headers: this.buildHeaders(authToken),
                url: this.buildServiceUrl(service.host),
                body: this.buildRequestBody()
            }, (error, response, body) => {
                if (response.statusCode !== 200) {
                    app.logger.error(`Failed to update ${service.name} bot stats, the API returned an error:`);
                    app.logger.error(error, body);
                }

                return resolve();
            });
        });
    }
}

module.exports = DiscordBotStatsUpdateJob;
