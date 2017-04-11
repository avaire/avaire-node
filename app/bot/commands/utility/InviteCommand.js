/** @ignore */
const Command = require('./../Command');

class InviteCommand extends Command {
    constructor() {
        super('!', 'invite', ['join'], {
            description: [
                'Tells you about what commands the bot has, what they do and how you can use them.'
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
        return app.envoyer.sendInfo(message, 'commands.general.invite.message', {
            oauth: app.config.bot.oauth
        });
    }
}

module.exports = InviteCommand;
