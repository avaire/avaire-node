/** @ignore */
const Command = require('./../Command');

class BlahCommand extends Command {
    constructor() {
        super('>', 'blah', [], {
            description: 'Blah?'
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
        return app.envoyer.sendSuccess(message, 'commands.fun.blah');
    }
}

module.exports = BlahCommand;
