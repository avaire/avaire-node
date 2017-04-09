/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Discord Bot Stats Update job, this job runs once every three hours of the bots uptime,
 * every cycle the job will send a HTTP POST request to the discord.pw API, attempting
 * to update the number of guilds the bot has, if no discord.pw API token has been
 * given the job will cancel itself out before making the HTTP rquest.
 *
 * @extends {Job}
 */
class DiscordBotStatsUpdateJob extends Job {

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
        let discordToken = app.config.apiKeys.discordstats;
        if (typeof discordToken !== 'string' || discordToken.length === 0) {
            return;
        }

        request({
            headers: {
                'User-Agent': 'AvaIre-Discord-Bot',
                'Content-Type': 'application/json',
                Authorization: discordToken
            },
            url: `https://bots.discord.pw/api/bots/${bot.User.id}/stats`,
            method: 'POST',
            json: true,
            body: {
                server_count: bot.Guilds.length
            }
        }, (error, response, body) => {
            if (response.statusCode !== 200) {
                app.logger.error('Failed to update stats.discord.pw bot stats, the API returned an error:');
                app.logger.error(error);
            }
        });
    }
}

module.exports = DiscordBotStatsUpdateJob;
