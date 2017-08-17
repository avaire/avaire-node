/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Send Server Lob Webhook Job, this job runs every minute, each cycle the job will check
 * if any new server data has been logged, if there is new data and a valid webhook has
 * been setup the POST request data will be built up and the webhook endpoint will be
 * hit with all the data, posting the log messages to the Discord channel.
 *
 * @extends {Job}
 */
class SendServerLogWebhookJob extends Job {

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        if (!app.process.isReady) {
            return;
        }

        let embeds = app.shard.logger.pullData();
        if (embeds.length === 0) {
            return;
        }

        request({
            json: true,
            method: 'POST',
            url: this.webhookEndpoint,
            headers: {
                'User-Agent': `AvaIre-Discord-Bot (${bot.User.id})`,
                'Content-Type': 'application/json'
            },
            body: {
                username: bot.User.username,
                avatar_url: bot.User.avatarURL,
                embeds
            }
        }, (error, response, body) => {
            if (!(response.statusCode <= 266 && response.statusCode >= 200)) {
                app.logger.raven(new Error('Failed to send embed message.'), {
                    embeds
                });
            }
        });
    }

    /**
     * The webhook url endpoint that should be hit
     * to send the server join/leave messages.
     *
     * @return {String}
     */
    get webhookEndpoint() {
        return `https://discordapp.com/api/webhooks/${app.config.webhook.id}/${app.config.webhook.token}`;
    }
}

module.exports = SendServerLogWebhookJob;
