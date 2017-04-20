/** @ignore */
const Command = require('./../Command');

class InviteCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('!', 'invite', ['join'], {
            description: [
                'Gives you the OAuth2 invite link you can use to invite the bot with.'
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
