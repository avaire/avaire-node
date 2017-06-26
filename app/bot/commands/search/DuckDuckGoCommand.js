/** @ignore */
const query = require('querystring');
/** @ignore */
const request = require('request');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class DuckDuckGoCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('search', ['ddg', 'g'], {
            middleware: [
                'throttle.user:2,5'
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
            return this.sendMissingArguments(message);
        }

        request({
            headers: {
                'User-Agent': `AvaIre-Discord-Bot (${bot.User.id})`,
                'Accept-Language': 'en-US,en;q=0.8,en-GB;q=0.6,da;q=0.4',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: 0
            },
            url: 'https://duckduckgo.com/html/?q=' + this.removeBangs(args.join('+')),
            method: 'GET'
        }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                app.logger.error(error);
                return app.envoyer.sendNormalMessage(message, 'The API returned an unconventional response.');
            }

            let urls = this.buildUrls(body, 4);
            if (urls.length === 0) {
                return app.envoyer.sendWarn(message, 'Looks like there were nothing matching your search query.');
            }

            let seeAlso = [];
            for (let i = 1; i < urls.length; i++) {
                seeAlso.push(urls[i]);
            }

            return app.envoyer.sendEmbededMessage(message, {
                color: 0xDE5833,
                title: `Search result for: ${args.join(' ')}`,
                description: `${urls[0]}\n**See also**\n${seeAlso.join('\n')}`
            });
        });
    }

    /**
     * Builds the given number of urls from the given request body.
     *
     * @param  {String}  body     The body of the request.
     * @param  {Number}  results  The number of results that should be returned.
     * @return {Array}
     */
    buildUrls(body, results = 10) {
        let urls = [];
        let parts = _.drop(body.split('links_main'));

        for (let i = 0; i < results && i < 100; i++) {
            let url = this.seperateUrl(parts[i], 'uddg=', '">');

            if (url === null || url.indexOf('r.search.yahoo.com/cbclk') > -1) {
                results++;
                continue;
            }

            urls.push(url);
        }

        if (urls.length === 1 && urls[0] === '') {
            return [];
        }

        return _.map(urls, link => {
            if (link.length < 72) {
                return link;
            }
            return `[${link.substr(0, 72)}...](${link})`;
        });
    }

    /**
     * Seperates the given part.
     *
     * @param  {String}  part   The part that should have its url seperated.
     * @param  {String}  start  The start of the separator.
     * @param  {String}  end    The end of the separator.
     * @return {String|null}
     */
    seperateUrl(part, start, end) {
        if (part === undefined || part === null) {
            return null;
        }

        let linkParts = part.split(start);
        if (linkParts.length < 1) {
            return null;
        }
        return query.unescape(linkParts[1].split('">')[0]);
    }

    /**
     * Remove bangs from the start of the given string.
     *
     * @param  {String}  string  The string that should be formatted.
     * @return {String}
     */
    removeBangs(string) {
        if (string.substr(0, 1) !== '!') {
            return string;
        }
        return this.removeBangs(string.substr(1, string.length));
    }
}

module.exports = DuckDuckGoCommand;
