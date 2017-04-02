/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class KickCommand extends Command {
    constructor() {
        super('.', 'kick', [], {
            allowDM: false,
            description: 'Kicks the mentioned user off the server with the provided reason, this action will be reported to any channel that has modlogggin enabled on the server.',
            usage: [
                '<user> [reason]'
            ],
            middleware: [
                'throttle.user:2,5',
                'require:general.kick_members'
            ]
        });
    }

    onCommand(sender, message, args) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'language.errors.missing-arguments', {
                command: this.getPrefix() + this.getTriggers()[0]
            });
        }

        let user = this.getUser(message, args.shift());
        if (user === undefined) {
            return;
        }

        user.kick().then(() => {
            let reason = (args.join(' ').trim().length === 0) ? '*No reason given*' : `"${args.join(' ')}"`;

            return app.bot.features.modlog.send(message, sender, user, `:target was kicked by :sender for ${reason}`);
        }).catch(err => {
            app.logger.error(err);
            return app.envoyer.sendWarn(message, `Failed to kick ${user.username}#${user.discriminator} due to an error: ${err.message}`);
        });
    }

    getUser(message, user) {
        if (message.mentions.length > 0) {
            user = message.mentions[0].id;
        }

        user = message.guild.members.find(gUser => gUser.id === user);

        if (user === undefined) {
            message.channel.sendMessage(':warning: Invalid user id provided, please use a valid id of the user you want to kick');
            return undefined;
        }

        return user;
    }
}

module.exports = KickCommand;
