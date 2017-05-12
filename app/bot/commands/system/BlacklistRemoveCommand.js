/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');

class BlacklistRemoveCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('blr', [], {
            description: 'Removes a given user ID from the bot blacklist.',
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

        return app.bot.features.blacklist.removeUser(args[0]).then(() => {
            return app.envoyer.sendSuccess(message, '<@:id> (:id) has been removed from the bot blacklist.', {
                id: args[0]
            });
        }).catch(err => {
            app.logger.error(err);

            return app.envoyer.sendError(message, err.hasOwnProperty('message') ? err.message : err);
        });
    }
}

module.exports = BlacklistRemoveCommand;
