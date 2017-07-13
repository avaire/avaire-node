/** @ignore */
const request = require('request');

/**
 * The abstract interaction class, this class is used
 * to prepare, and run bot-user interactions.
 *
 * @abstract
 */
class Interaction {

    /**
     * Creates the interaction with the given name, triggers, and respponses.
     *
     * @param  {String}  interaction  The interaction word that should be sent in the interaction message.
     * @param  {Array}   triggers     The triggers that should invoke the interaction.
     * @param  {Array}   images       The list of images that can be returned by the interaction.
     */
    constructor(interaction, triggers = [], images = []) {
        /**
         * The interaction message.
         *
         * @type {String}
         */
        this.interaction = interaction;

        /**
         * The array of interaction triggers.
         *
         * @type {Array}
         */
        this.triggers = triggers;

        /**
         * The array of interaction images.
         *
         * @type {Array}
         */
        this.images = images;

        if (typeof this.images === 'string') {
            this.images = [this.images];
        }
    }

    /**
     * Builds and returns the interaction message.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @param  {IMember}   sender   The user who triggered the interaction.
     * @param  {IMember}   target   The receiving user for the interaction.
     * @return {String}
     */
    getInteractionMessage(message, sender, target) {
        return app.lang.formatResponse(message, '**:mentionUser** :interaction **:mentionTarget**', this.preparePlaceholders(sender, target));
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
     * Prepares the message placeholders for the current interaction.
     *
     * @param  {IMember}  sender  The user who triggered the interaction.
     * @param  {IMember}  target  The receiving user for the interaction.
     * @return {Object}
     */
    preparePlaceholders(sender, target) {
        return {
            mentionUser: sender.nick === null ? sender.username : sender.nick,
            mentionTarget: target.nick === null ? target.username : target.nick,
            interaction: this.interaction
        };
    }

    /**
     * Executes the given interaction, this method can be overwritten by a child instance
     * of the interaction class to change what the interaction does when it is invoked.
     *
     * @param  {IMember}   sender   The user who triggered the interaction.
     * @param  {IMember}   target   The receiving user for the interaction.
     * @param  {IMessage}  message  The Discordie message object.
     * @param  {Array}     args     The arguments given to the interaction.
     * @return {mixed}
     */
    onInteraction(sender, target, message, args) {
        return this.sendInteraction(
            message,
            this.pickRandom(this.images),
            this.getInteractionMessage(message, sender, target)
        );
    }

    /**
     * Sends the interaction to the given channel with
     * the given image url and interaction message.
     *
     * @param  {IMessage}  message      The Discordie message object.
     * @param  {String}    url          The url of the image that should be sent.
     * @param  {String}    interaction  The interaction message.
     * @return {mixed}
     */
    sendInteraction(message, url, interaction) {
        return request({
            encoding: 'binary', url
        }, (error, response, body) => {
            return message.channel.uploadFile(Buffer.from(body, 'binary'), `${this.constructor.name}.gif`, interaction)
                          .catch(err => app.logger.error(err));
        });
    }
}

module.exports = Interaction;
