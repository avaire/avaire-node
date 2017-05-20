/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class GfycatCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('gfycat', ['gif'], {
            description: 'I will get a random dog for you',
            middleware: [
                'throttle.channel:1,1'
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

        request('https://api.gfycat.com/v1test/gfycats/search?count=25&search_text=' + args.join('+'), (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    if (parsed.hasOwnProperty('errorMessage') || !parsed.hasOwnProperty('gfycats')) {
                        return app.envoyer.sendWarn(message, 'Invalid query string given, I found nothing for `:query`', {
                            query: args.join(' ')
                        });
                    }

                    let images = parsed.gfycats;
                    let image = images[Math.floor(Math.random() * images.length)];

                    return this.sendImage(message, image);
                } catch (err) {
                    app.logger.error(err);
                    return app.envoyer.sendNormalMessage(message, 'The API returned an unconventional response.');
                }
            }
        });
    }

    /**
     * Sends the gfycat image message back to the user with the given image.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Object}    image    The image object that should be sent.
     * @return {Promise}
     */
    sendImage(message, image) {
        if (!image.hasOwnProperty('gifUrl')) {
            image.gifUrl = image.url;
        }

        return app.envoyer.sendNormalMessage(message, ' ' + image.gifUrl).then(() => {
            // I'll leave this code here. This code is used for some other commands too but
            // I (Alexis) just doesn't feel like it works as well for this command as it
            // does for the others... So I'll leave the code in but it won't be active.
            //
            // return app.envoyer.sendEmbededMessage(message, {
            //     color: parseInt(image.avgColor.substr(1), 16),
            //     description: `**${image.title}**\n${image.description}\nhttps://gfycat.com/${image.gfyName}`,
            //     footer: {
            //         text: `GFYCat #${image.gfyNumber}`
            //     }
            // });
        });
    }
}

module.exports = GfycatCommand;
