/** @ignore */
const crypto = require('crypto');

class BroadcastModule {

    /**
     * Prepares the broadcast module.
     */
    constructor() {
        /**
         * [preparedMessages description]
         *
         * @type {Object}
         */
        this.preparedMessages = {};
    }

    /**
     * Prepares the message for broadcasting.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the module.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {Object}
     */
    prepareMessage(message, args) {
        let hash = crypto.createHash('md5').update(String(process.uptime())).digest('hex');
        let broadcast = args.join(' ');

        this.preparedMessages[hash] = broadcast;

        app.scheduler.scheduleDelayedTask(() => {
            if (this.hasProperty(hash)) {
                delete this.preparedMessages[hash];
            }
        }, 1000 * 120);

        return {hash, broadcast};
    }

    /**
     * Sends the message linked to the hash if it exists, the message will be sent to
     * 5 servers at a time with a 500 milisecond pause inbetween them broadcasts,
     * this should help prevent hitting the API request limit.
     *
     * @param  {String}  hash        The hash message that should be broadcasted.
     * @param  {Number}  startIndex  The start index of the for-loop, defaults to 0.
     * @param  {Array}   guilds      The guilds collection that should be broadcasted to, defaults to null.
     * @return {Boolean}
     */
    sendMessage(hash, startIndex = 0, guilds = null) {
        if (!this.hasProperty(hash)) {
            return;
        }

        let description = this.preparedMessages[hash];

        if (guilds === null) {
            guilds = bot.Guilds.toArray();
        }

        let increments = startIndex + 5;
        for (let i = startIndex; i < guilds.length; i++) {
            if (i >= increments) {
                return app.scheduler.scheduleDelayedTask(() => {
                    return this.sendMessage(hash, i, guilds);
                }, 500);
            }

            let guild = guilds[i];

            app.envoyer.sendEmbededMessage(guild.generalChannel, {
                color: 0xE91E63, description
            });
        }

        return true;
    }

    /**
     * Checks if the hash exists.
     *
     * @param  {String}  hash  The hash that should be checked.
     * @return {Boolean}
     */
    hasProperty(hash) {
        return this.preparedMessages.hasOwnProperty(hash);
    }
}

module.exports = new BroadcastModule;
