/** @ignore */
const URL = require('url');
/** @ignore */
const expander = require('expand-url');
/** @ignore */
const Command = require('./../Command');

class ExpandUrlCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('expand', ['e'], {
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
            return app.envoyer.sendWarn(message, 'Invalid URL given, you must give a valid short url to expand.');
        }

        return expander.expand(url, (err, longUrl) => {
            if (err) {
                app.logger.error(err);

                return app.envoyer.sendError(message, 'Looks like something went wrong while trying to expand your URL, try again later.');
            }

            if (longUrl.toLowerCase() === url.toLowerCase()) {
                return app.envoyer.sendWarn(message, '<@:userid> :url is not a short url.', {
                    url
                });
            }

            return app.envoyer.sendSuccess(message, '<@:userid> :url resolves into :longUrl', {
                longUrl, url
            });
        });
    }
}

module.exports = ExpandUrlCommand;
