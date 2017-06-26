/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');

class BotAdminAddCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('baa', [], {
            usage: '<user>',
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
            return this.sendMissingArguments(message);
        }

        app.config.botAccess.push(args[0]);
        return app.envoyer.sendInfo(message, '`:botid` has been added to the bot administrative list temporarily.', {
            botid: args[0]
        });
    }
}

module.exports = BotAdminAddCommand;
