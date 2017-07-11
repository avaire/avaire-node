/** @ignore */
const Command = require('./../Command');

class SayCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('say', [], {
            usage: '[message]',
            middleware: [
                'throttle.user:2,4',
                'require.user:text.manage_messages'
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
            return this.sendMissingArguments(message);
        }

        if (message.isPrivate) {
            return app.envoyer.sendNormalMessage(message, args.join(' '));
        }

        return app.envoyer.delete(message).then(() => {
            return app.envoyer.sendNormalMessage(message, args.join(' '), {}, true);
        }).catch(err => app.logger.error(err));
    }
}

module.exports = SayCommand;
