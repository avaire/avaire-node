/** @ignore */
const URL = require('url');
/** @ignore */
const googl = require('goo.gl');
/** @ignore */
const Command = require('./../Command');

class ShortenUrlCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('shorten', ['s'], {
            usage: '<url>'
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
            return this.sendMissingArguments(message);
        }

        let url = args[0];
        let parsedUrl = URL.parse(url);
        if (parsedUrl.host === null) {
            return app.envoyer.sendWarn(message, 'Invalid URL given, you must give a valid url to shorten.');
        }

        googl.setKey(app.config.apiKeys.google);
        return googl.shorten(url).then(shortUrl => {
            return app.envoyer.sendSuccess(message, '<@:userid> You can now use :shortUrl instead of the long url:\n:url', {
                shortUrl, url
            });
        }).catch(err => {
            app.logger.error(err);

            return app.envoyer.sendError(message, 'Looks like something went wrong while trying to shorten your URL, try again later.');
        });
    }
}

module.exports = ShortenUrlCommand;
