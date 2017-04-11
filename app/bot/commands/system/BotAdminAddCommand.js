/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');

class BotAdminAddCommand extends Command {
    constructor() {
        super(';', 'baa', [], {
            middleware: [
                'isBotAdmin'
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

        app.config.botAccess.push(args[0]);
        return app.envoyer.sendInfo(message, '`:botid` has been added to the bot administrative list temporarily.', {
            botid: args[0]
        });
    }
}

module.exports = BotAdminAddCommand;
