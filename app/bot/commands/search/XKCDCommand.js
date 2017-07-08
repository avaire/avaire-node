/** @ignore */
const request = require('request');
/** @ignore */
const moment = require('moment');
/** @ignore */
const Command = require('./../Command');

class XKCDCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('xkcd', [], {
            usage: '[comic id]',
            middleware: [
                'throttle.user:1,2'
            ]
        });
    }

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        if (args.length === 0) {
            return this.makeRequest(message, 'https://xkcd.com/info.0.json', 0);
        }

        let comic = Math.max(parseInt(args[0], 10), 1);
        if (app.cache.has('https://xkcd.com/info.0.json')) {
            comic = Math.min(comic, app.cache.get('https://xkcd.com/info.0.json').num);
        }

        return this.makeRequest(message, `https://xkcd.com/${comic}/info.0.json`, Math.min(comic, 3000));
    }

    /**
     * Make a processes a request to the XKCD api.
     *
     * @param  {IMessage}  message      The Discordie message object that triggered the command.
     * @param  {String}    url          The URL that the request should be made to.
     * @param  {Number}    comicNumber  The comics id number.
     * @return {mixed}
     */
    makeRequest(message, url, comicNumber) {
        return request(url, (error, response, body) => {
            if (response.statusCode === 404) {
                return app.envoyer.sendWarn(message, 'Invalid xkcd comic number given, there are no comics with an ID of **#:comic**', {
                    comic: comicNumber
                });
            }

            if (error || response.statusCode !== 200) {
                return;
            }

            try {
                // If we're getting the latest comic we'll cache the result for 30 minutes,
                // if it is any other comic we'll cache it for 2 hours and 30 minutes.
                return this.sendComic(message, app.cache.remember(url, comicNumber === 0 ? 60 : 9000, () => {
                    return JSON.parse(body);
                }));
            } catch (err) {
                app.logger.error(err);
            }
        });
    }

    /**
     * Sends the comic message back to the user with the given comic.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Object}    comic    The comic object that should be sent.
     * @return {Promise}
     */
    sendComic(message, comic) {
        return app.envoyer.sendNormalMessage(message, ' ' + comic.img, {comic: comic.num}).then(() => {
            let timestamp = moment(`${comic.year}-${comic.month}-${comic.day}`, 'YYYY-MM-DD');

            return app.envoyer.sendEmbededMessage(message, {
                color: 0x96A8C8,
                description: `**${comic.safe_title}**\n${comic.alt}`,
                timestamp: timestamp.toDate(),
                footer: {
                    text: `XKCD number #${comic.num}`
                }
            });
        });
    }
}

module.exports = XKCDCommand;
