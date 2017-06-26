/** @ignore */
const dot = require('dot-object');
/** @ignore */
const Command = require('./../Command');

/**
 * User ID Command, gets the user id of the
 * current user, or the taged user.
 *
 * @extends {Command}
 */
class UserIdCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('userid', ['uid'], {
            allowDM: false
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
        let user = sender;

        if (message.mentions.length > 0) {
            user = message.mentions[0];
        }

        return app.envoyer.sendSuccess(message, 'commands.administration.userid.message', {
            target: `${user.username}#${user.discriminator}`,
            targetid: user.id
        });
    }
}

module.exports = UserIdCommand;
