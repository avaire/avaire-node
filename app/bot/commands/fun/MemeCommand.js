/** @ignore */
const query = require('querystring');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class MemeCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('meme', [], {
            usage: '<meme|user|list> [top text] [bottom text]',
            middleware: [
                'throttle.user:2,4'
            ]
        });

        /**
         * The MemeGenerator template URL.
         *
         * @type {String}
         */
        this.templateUrl = 'https://memegen.link/api/templates/';

        /**
         * The MemeGeneratoe custom URL.
         *
         * @type {String}
         */
        this.customUrl = 'https://memegen.link/custom/';
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

        let type = args[0].toLowerCase();
        if (type === 'list') {
            return this.sendMemeList(sender, message, _.drop(args));
        }

        let user = this.getUserFromType(message, type);
        if (user !== null) {
            return this.sendUserMeme(sender, message, user, _.drop(args));
        }

        let meme = this.getMeme(type);
        if (meme !== null) {
            return this.sendGeneratedMeme(sender, message, meme, _.drop(args));
        }

        return app.envoyer.sendWarn(message, 'Invalid meme type given, try and use `:command list` to see a list of valid meme types.', {
            command: this.getCommandTrigger(message)
        });
    }

    /**
     * Sends the list of meems available to the user.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {Promise}
     */
    sendMemeList(sender, message, args) {
        let memes = app.cache.get('meme.types');

        let pageNumber = 1;
        if (args.length > 0) {
            pageNumber = parseInt(args[0], 10);
        }

        if (isNaN(pageNumber) || pageNumber < 1) {
            pageNumber = 1;
        }

        let pages = Math.ceil(memes.length / 10);
        if (pageNumber > pages) {
            pageNumber = pages;
        }

        let memesMessages = [];
        let start = 10 * (pageNumber - 1);
        for (let i = start; i < start + 10; i++) {
            if (memes.length <= i) {
                break;
            }

            let meme = memes[i];

            memesMessages.push(`\`${meme.trigger}\` => ${meme.name}`);
        }

        return app.envoyer.sendEmbededMessage(message, {
            title: 'Memes',
            color: app.envoyer.colors.success,
            description: memesMessages.join('\n') + '\n\nPage **:page** out of **:pages** pages.\n`:command list [page number]`'
        }, {
            command: this.getCommandTrigger(message),
            page: pageNumber, pages
        });
    }

    /**
     * Generates a meme with the tagged users avatar as a base and sends to to the text channel.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {IUser}     user     The user that was tagged in the message.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {[type]}         [description]
     */
    sendUserMeme(sender, message, user, args) {
        if (args.length < 2) {
            return this.sendMissingArguments(message);
        }

        let text = this.generateMemeText(args);
        if (text === null) {
            return app.envoyer.sendWarn(message, 'The top and bottom messages can\'t be empty!');
        }

        let userAvatar = `https://images.discordapp.net/avatars/${user.id}/${user.avatar}.png?size=256`;

        message.channel.sendTyping();
        return this.uploadMeme(message, `${this.customUrl}${text.top}/${text.bottom}.jpg?alt=${userAvatar}`);
    }

    /**
     * Generates a meme with the given meme type as a base and sends to to the text channel.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Object}    meme     The meme object that was given to the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {Promise}
     */
    sendGeneratedMeme(sender, message, meme, args) {
        if (args.length < 2) {
            return this.sendMissingArguments(message);
        }

        let text = this.generateMemeText(args);
        if (text === null) {
            return app.envoyer.sendWarn(message, 'The top and bottom messages can\'t be empty!');
        }

        message.channel.sendTyping();
        return request({
            headers: {'User-Agent': `AvaIre-Discord-Bot (${bot.User.id})`},
            url: `${this.templateUrl}${meme.trigger}/${text.top}/${text.bottom}`,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    if (!parsed.hasOwnProperty('direct')) {
                        return app.envoyer.sendError(message, 'Something went wrong while trying to generate your meme :(');
                    }

                    return this.uploadMeme(message, parsed.direct.masked);
                } catch (err) {
                    app.logger.error(err);
                    return app.envoyer.sendError(message, 'Something went wrong while trying to generate your meme :(');
                }
            }
        });
    }

    /**
     * Uploads the image for the given URL to the current text channel.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    url      The image url that should be uploaded to Discord.
     * @return {Promise}
     */
    uploadMeme(message, url) {
        return request({
            encoding: 'binary', url
        }, (error, response, body) => {
            return message.channel.uploadFile(Buffer.from(body, 'binary'))
                          .catch(err => app.logger.error(err));
        });
    }

    /**
     * Gets the user from type if the user was mentioned in the given
     * message, if the user is not found the method will return null.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    string   The command string type.
     * @return {IUser|null}
     */
    getUserFromType(message, string) {
        if (message.mentions.length === 0) {
            return null;
        }

        if (!(_.startsWith(string, '<@') && _.endsWith(string, '>'))) {
            return null;
        }

        return message.mentions[0];
    }

    /**
     * Get meme object from the given string if it
     * is a valid meme, otherwise returns null.
     *
     * @param  {String}  string  The meme string type that should be checked.
     * @return {Object|null}
     */
    getMeme(string) {
        let types = app.cache.get('meme.types');
        for (let i in types) {
            let type = types[i];

            if (type.trigger === string) {
                return type;
            }
        }
        return null;
    }

    /**
     * Generates the meme text from the given arguments.
     *
     * @param  {Array}  args  The arguments the meme text should be generated from.
     * @return {Object}
     */
    generateMemeText(args) {
        let topText = args[0].trim().replace(/ /g, '_');
        let botText = args[1].trim().replace(/ /g, '_');

        if (topText.length === 0 || botText.length === 0) {
            return null;
        }

        return {
            top: query.escape(topText),
            bottom: query.escape(botText)
        };
    }
}

module.exports = MemeCommand;
