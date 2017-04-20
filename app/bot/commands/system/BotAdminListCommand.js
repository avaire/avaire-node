/** @ignore */
const Command = require('./../Command');

class BotAdminListCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super(';', 'bal', [], {
            description: 'Lists all the current bot admins.',
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
        let admins = [];
        for (let id in app.config.botAccess) {
            admins.push(`<@${app.config.botAccess[id]}> (${app.config.botAccess[id]})`);
        }

        return app.envoyer.sendInfo(message, admins.join('\n'));
    }
}

module.exports = BotAdminListCommand;
