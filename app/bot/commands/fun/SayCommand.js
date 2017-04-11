/** @ignore */
const Command = require('./../Command');

class RollCommand extends Command {
    constructor() {
        super('>', 'say', ['echo'], {
            description: 'I will say anything you want'
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
        if (message.isPrivate) {
            return message.channel.sendMessage(args.join(' '));
        }

        message.delete().then(() => {
            message.channel.sendMessage(args.join(' '));
        }).catch(err => {
            app.logger.error(err);
        });
    }
}

module.exports = RollCommand;
