/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

class SourceCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('source', [], {
            description: 'Gives you the source code for the Bot, or the code for a given command.',
            usage: [
                '',
                '[command]'
            ]
        });

        this.rootUrl = 'https://github.com/AvaIre/AvaIre';
        this.commandUrl = 'https://github.com/AvaIre/AvaIre/blob/master/app/bot/commands/:category/:commandfile.js';
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
            return app.envoyer.sendInfo(message, 'AvaIre source code:\n\n' + this.rootUrl);
        }

        let command = CommandHandler.getCommand(args[0]);

        if (command === null) {
            return app.envoyer.sendInfo(message, 'Invalid command given, here is the full source instead.\n\n' + this.rootUrl);
        }

        return app.envoyer.sendInfo(message, 'AvaIre source code for the **:command** command:\n\n' + this.commandUrl, {
            commandfile: command.name,
            category: command.category,
            command: args[0].toLowerCase()
        });
    }
}

module.exports = SourceCommand;
