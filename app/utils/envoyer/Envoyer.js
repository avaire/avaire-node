/** @ignore */
const _ = require('lodash');

/**
 * Envoyer, creates a simple way of sending embed messages to channels, the methods is highly adaptable, allowing
 * you to use the syntax you like best, you can also send language strings instead of messages, and the methods
 * will pickup on the fact you're sending a language string and fetch the corresponding message for you, just
 * keep in mind that sending language messages requires you to parse in the IMessage Discordie object.
 *
 * @see http://qeled.github.io/discordie/#/docs/IMessage
 * @see http://qeled.github.io/discordie/#/docs/ITextChannel
 * @see https://discordapp.com/developers/docs/resources/channel#embed-object
 */
class Envoyer {

    /**
     * Prepares the default colors for the different types of messages that can be sent.
     */
    constructor() {
        /**
         * The default colors for the different types of messages that can be sent.
         *
         * @type {Object}
         */
        this.colors = {
            error: 0xd91616,
            warn: 0xd9d016,
            success: 0x16d940,
            info: 0x1653d9
        };
    }

    /**
     * Sends an embeded error message, if the message given looks like a language
     * string and the IMessage object was provided the language message will
     * be fetched from the string for the provided message.
     *
     * @param  {IMessage|ITextChannel} channel       The IMessage or ITextChannel object from Discordies event emitter.
     * @param  {String}                message       The message that should be sent, or the language string that should be fetched.
     * @param  {Object}                placeholders  The placeholders that should replace placeholders in the language string.
     * @return {Promise}
     */
    sendError(channel, message, placeholders) {
        return this.sendEmbededMessage(channel, this.transform('error', message), placeholders);
    }

    /**
     * Sends an embeded warning message, if the message given looks like a language
     * string and the IMessage object was provided the language message will
     * be fetched from the string for the provided message.
     *
     * @param  {IMessage|ITextChannel} channel       The IMessage or ITextChannel object from Discordies event emitter.
     * @param  {String}                message       The message that should be sent, or the language string that should be fetched.
     * @param  {Object}                placeholders  The placeholders that should replace placeholders in the language string.
     * @return {Promise}
     */
    sendWarn(channel, message, placeholders) {
        return this.sendEmbededMessage(channel, this.transform('warn', message), placeholders);
    }

    /**
     * Sends an embeded info message, if the message given looks like a language
     * string and the IMessage object was provided the language message will
     * be fetched from the string for the provided message.
     *
     * @param  {IMessage|ITextChannel} channel       The IMessage or ITextChannel object from Discordies event emitter.
     * @param  {String}                message       The message that should be sent, or the language string that should be fetched.
     * @param  {Object}                placeholders  The placeholders that should replace placeholders in the language string.
     * @return {Promise}
     */
    sendInfo(channel, message, placeholders) {
        return this.sendEmbededMessage(channel, this.transform('info', message), placeholders);
    }

    /**
     * Sends an embeded success message, if the message given looks like a language
     * string and the IMessage object was provided the language message will
     * be fetched from the string for the provided message.
     *
     * @param  {IMessage|ITextChannel} channel       The IMessage or ITextChannel object from Discordies event emitter.
     * @param  {String}                message       The message that should be sent, or the language string that should be fetched.
     * @param  {Object}                placeholders  The placeholders that should replace placeholders in the language string.
     * @return {Promise}
     */
    sendSuccess(channel, message, placeholders) {
        return this.sendEmbededMessage(channel, this.transform('success', message), placeholders);
    }

    /**
     * Sends an embeded message of the provided color to the given channel or
     * message object, if the message given looks like a language string
     * and the IMessage object was provided the language message will
     * be fetched from the string for the provided message.
     *
     * @param  {IMessage|ITextChannel} channel       The IMessage or ITextChannel object from Discordies event emitter.
     * @param  {String}                message       The message that should be sent, or the language string that should be fetched.
     * @param  {String|Number}         color         The color of the embeded element, by default it will be info(blue).
     * @param  {Object}                placeholders  The placeholders that should replace placeholders in the language string.
     * @return {Promise}
     */
    sendMessage(channel, message, color = 'info', placeholders) {
        return this.sendEmbededMessage(channel, this.transform(color, message), placeholders);
    }

    /**
     * sends an embed message to the provided channel, if an IMessage object is given the
     * correct channel will be fetchedfrom the message, if the embed message looks like
     * a language string and the IMessage object was provided the language message
     * will be fetched from the string for the provided message.
     *
     * @see https://discordapp.com/developers/docs/resources/channel#embed-object
     *
     * @param  {IMessage|ITextChannel} channel       The IMessage or ITextChannel object from Discordies event emitter.
     * @param  {Object}                embed         The embeded object that should be sent.
     * @param  {Object}                placeholders  The placeholders that should replace placeholders in the language string.
     * @return {Promise}              [description]
     */
    sendEmbededMessage(channel, embed, placeholders) {
        // If the channel parameter is an IMessage Discordie object and the description of the
        // embed object looks like a language string, the description of the embed object
        // will be replaced by the language specific equivalent of the language string.
        if (channel.constructor.name === 'IMessage' && this.isLangString(embed.description)) {
            embed.description = app.lang.get(channel, embed.description, placeholders);
        }

        // If the channel parameter is an IMessage Discordie object we'll convert
        // it to a ITextChannel object instead so we can send messages from it.
        if (channel.constructor.name === 'IMessage') {
            channel = channel.channel;
        }

        // If some placeholders have been provided we'll lopp through them
        // and replace their placeholder token with the propper value.
        if (_.isPlainObject(placeholders)) {
            for (let token in placeholders) {
                embed.description = _.replace(embed.description, new RegExp(`:${token}`, 'gm'), placeholders[token]);
            }
        }

        return channel.sendMessage('', false, embed);
    }

    /**
     * Transforms the provided color and message into
     * a simple Discord embed message object.
     *
     * @param  {String|Number} color    The color of the embeded element.
     * @param  {String}        message  The description of the embed element.
     * @return {Object}
     */
    transform(color, message) {
        if (typeof this.colors[color] !== 'undefined') {
            color = this.colors[color];
        }

        return {
            color: color,
            description: message
        };
    }

    /**
     * Checks if the provided string looks like a language string by making
     * sure it doesn't contain any spaces or new lines, and contains
     * atleast one dot but doesn't start or ends with a dot.
     *
     * @param  {String}  string  The string that should be checked.
     * @return {Boolean}
     */
    isLangString(string) {
        return string.indexOf(' ') === -1 &&
               string.indexOf('\n') === -1 &&
               string.indexOf('.') !== -1 &&
               string.substr(0, 1) !== '.' &&
               string.substr(-1) !== '.';
    }
}

module.exports = new Envoyer;
