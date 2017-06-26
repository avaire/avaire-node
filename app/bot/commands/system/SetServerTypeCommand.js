/** @ignore */
const util = require('util');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class SetServerTypeCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('sst', [], {
            allowDM: false,
            usage: '<type> [server id]',
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

        let type = parseInt(args[0], 10);
        if (isNaN(type)) {
            return app.envoyer.sendWarn(message, 'Invalid type given, the type must be an integer!');
        }

        let guildId = app.getGuildIdFrom(message);
        if (args.length > 1) {
            guildId = args[1];
        }

        return app.database.update(app.constants.GUILD_TABLE_NAME, {type}, query => query.where('id', guildId)).then(() => {
            return app.envoyer.sendSuccess(message, 'The server with an ID of **:id** has been updated to server type `:type`', {
                id: guildId, type
            });
        }).catch(err => app.logger.error(err));
    }
}

module.exports = SetServerTypeCommand;
