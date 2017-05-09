/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');

class BlacklistAddCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('bla', [], {
            description: 'Add a given user ID to the bot blacklist.',
            usage: '<user> [reason]',
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

        let user = bot.Users.get(args[0]);
        if (user === null) {
            return app.envoyer.sendWarn(message, 'Invalid user id given, there are no users with the ID `:id`', {
                id: args[0]
            });
        }

        delete args[0];
        let reason = args.join(' ');

        return app.bot.features.blacklist.addUser(user, reason === '' ? null : reason).then(() => {
            return app.envoyer.sendSuccess(message, '<@:id> (:id) has been added to the bot blacklist.', {
                id: user.id
            });
        }).catch(err => {
            app.logger.error(err);

            return app.envoyer.sendError(message, err.hasOwnProperty('message') ? err.message : err);
        });
    }
}

module.exports = BlacklistAddCommand;
