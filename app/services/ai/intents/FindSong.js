/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Request song intent handler, this is used when someone requests
 * something that might be a song, or a song category supported
 * by Discord.FM, if the music trigger is a valid Discord.FM
 * category a random song from the given category will be
 * picked, otherwise the song title will be sent over to
 * the request command to fetch the actual song.
 *
 * @extends {IntentHandler}
 */
class RequestCat extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        let parameters = this.response.result.parameters;

        if (!parameters.hasOwnProperty('music')) {
            return app.envoyer.sendWarn(this.getMessage(),
                'Invalid or unsupported music category, more info comming here soon...'
            );
        }

        let handler = app.bot.commands.RequestCommand.handler;
        if (!this.categories.hasOwnProperty(parameters.music.toLowerCase())) {
            return handler.onCommand(bot.User, this.getMessage(), [parameters.music], false);
        }

        let songs = this.getSongsCacheFromCategory(parameters.music.toLowerCase());
        let song = this.pickRandom(songs);

        if (song.hasOwnProperty('url')) {
            return handler.onCommand(bot.User, this.getMessage(), [song.url], false);
        }

        if (song.service === 'YouTubeVideo' && song.hasOwnProperty('identifier')) {
            return handler.onCommand(bot.User, this.getMessage(), [
                `https://www.youtube.com/watch?v=${song.identifier}`
            ], false);
        }

        return handler.onCommand(bot.User, this.getMessage(), [song.title], false);
    }

    /**
     * Gets songs from the given cache category.
     *
     * @param  {String}  category  The category to get songs from.
     * @return {Array}
     */
    getSongsCacheFromCategory(category) {
        return app.cache.get(`discordfm.${this.pickRandom(this.categories[category])}`, []);
    }

    /**
     * Picks a random index from the given array.
     *
     * @param  {Array}  array  The array that a random item should be picked from.
     * @return {Array}
     */
    pickRandom(array) {
        return array[Math.floor(Math.random() * (array.length - 1))];
    }

    /**
     * Gets the suppported Discord.FM categories.
     *
     * @return {Object}
     */
    get categories() {
        return {
            electro: ['electro', 'electroswing'],
            classical: ['classical'],
            korean: ['korean'],
            hiphop: ['hiphop'],
            chill: ['chill'],
            metal: ['metal'],
            retro: ['retro'],
            rock: ['rock'],
            jazz: ['jazz'],
            pop: ['pop']
        };
    }
}

module.exports = RequestCat;
