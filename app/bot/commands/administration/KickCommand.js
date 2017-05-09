/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

/**
 * Kick Command, allows people with the right
 * permissions to kick people in guilds.
 *
 * @extends {Command}
 */
class KickCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('kick', [], {
            allowDM: false,
            description: 'Kicks the mentioned user off the server with the provided reason, this action will be reported to any channel that has modloging enabled on the server.',
            usage: '<user> [reason]',
            middleware: [
                'throttle.user:2,5',
                'require:general.kick_members'
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

    /**
     * Gets the IGuildMember user instance.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    user     The id of the user.
     * @return {IGuildMember|undefined}
     */
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
