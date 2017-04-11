/** @ignore */
const Feature = require('./../Feature');

/**
 * The Modlog feature.
 *
 * @extends {Feature}
 */
class Modlog extends Feature {

    /**
     * Sets up the Modlog feature with the Modlogging prefix.
     */
    constructor() {
        super();

        /**
         * The moglog prefix that should be added  for all Modlog messages.
         * @type {String}
         */
        this.prefix = '**[ModLog]** ';
    }

    /**
     * Sends a modlog message to all channels of the guild that has it enabled.
     *
     * @param  {IMesage}  message  The Discordie message object.
     * @param  {IUser}    sender   The user that triggered the modlog action.
     * @param  {IUser}    target   The target for the modlog action.
     * @param  {String}   reason   The reason for the modlog action.
     * @return {Promise}
     */
    send(message, sender, target, reason) {
        let formattedMessage = app.lang.formatResponse(message, reason, {
            sender: sender.username + '#' + sender.discriminator + ' (' + sender.id + ')',
            senderUser: sender.username + '#' + sender.discriminator,
            senderID: sender.id,
            target: target.username + '#' + target.discriminator + ' (' + target.id + ')',
            targetUser: target.username + '#' + target.discriminator,
            targetID: target.id
        });

        return app.database.getGuild(message.guild.id).then(transformer => {
            let channels = transformer.get('channels');

            for (let id in channels) {
                let channel = channels[id];

                if (!channel.modlog.enabled) {
                    continue;
                }

                let modlogChannel = message.guild.textChannels.find(textChannel => {
                    return textChannel.id === id;
                });

                if (modlogChannel === undefined) {
                    continue;
                }

                modlogChannel.sendMessage(this.prefix + formattedMessage);
            }
        });
    }
}

module.exports = new Modlog;
