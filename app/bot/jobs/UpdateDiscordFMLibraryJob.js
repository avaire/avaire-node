/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');

/**
 * Inactive Voice Stream job, this job runs every minute, every cycle the job will
 * go through all the voice connections and make sure they're still active and
 * being used(atleast one person is listening to the music), if no one is
 * listening and it's been too long the connection will be droped.
 *
 * @extends {Job}
 */
class UpdateDiscordFMLibraryJob extends Job {

    /**
     * The jobs constructor, this will check if the cache
     * already exists, if it doesn't it will create
     * it by calling the run method.
     */
    constructor() {
        super();

        this.run();
    }

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
        let discordFm = {
            electro: 'https://temp.discord.fm/libraries/electro-hub/json',
            chill: 'https://temp.discord.fm/libraries/chill-corner/json',
            korean: 'https://temp.discord.fm/libraries/korean-madness/json',
            classical: 'https://temp.discord.fm/libraries/classical/json',
            retro: 'https://temp.discord.fm/libraries/retro-renegade/json',
            metal: 'https://temp.discord.fm/libraries/metal-mix/json',
            hiphop: 'https://temp.discord.fm/libraries/hip-hop/json',
            electroswing: 'https://temp.discord.fm/libraries/electro-swing/json',
            pop: 'https://temp.discord.fm/libraries/purely-pop/json',
            rock: 'https://temp.discord.fm/libraries/rock-n-roll/json',
            jazz: 'https://temp.discord.fm/libraries/coffee-house-jazz/json'
        };

        for (let token in discordFm) {
            if (!app.cache.has(`discordfm.${token}`)) {
                this.requestAndSave(discordFm[token], `discordfm.${token}`);
            }
        }
    }

    /**
     * Make a request to the given url and stores it
     * in the file cache with the given token.
     *
     * @param  {String}  url    The url to make the request to.
     * @param  {String}  token  The token to store the result in.
     * @return {void}
     */
    requestAndSave(url, token) {
        request({
            headers: {'User-Agent': `AvaIre-Discord-Bot (${bot.User.id})`},
            method: 'GET', url
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    app.cache.forever(token, parsed);
                } catch (err) {
                    app.logger.error('Update Discord FM Library Job: The API returned an unconventional response.');
                    app.logger.error(err);
                }
            }
        });
    }
}

module.exports = UpdateDiscordFMLibraryJob;
