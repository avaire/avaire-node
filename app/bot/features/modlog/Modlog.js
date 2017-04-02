const Feature = require('./../Feature');

class Modlog extends Feature {
    constructor() {
        super();

        this.prefix = '**[ModLog]** ';
    }

    send(message, sender, target, reason) {
        let formattedMessage = app.lang.formatResponse(message, reason, {
            sender: sender.username + '#' + sender.discriminator + ' (' + sender.id + ')',
            senderUser: sender.username + '#' + sender.discriminator,
            senderID: sender.id,
            target: target.username + '#' + target.discriminator + ' (' + target.id + ')',
            targetUser: target.username + '#' + target.discriminator,
            targetID: target.id
        });

        app.database.getGuild(message.guild.id).then(transformer => {
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
