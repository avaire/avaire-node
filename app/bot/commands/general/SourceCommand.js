/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

class SourceCommand extends Command {
    constructor() {
        super('!', 'source', [], {
            description: 'Gives you the source code for the Bot, or the code for a given command.',
            usage: [
                '',
                '[command]'
            ]
        });

        this.rootUrl = 'https://github.com/Senither/AvaIre';
        this.commandUrl = 'https://github.com/Senither/AvaIre/blob/master/app/bot/commands/:category/:commandfile.js';
    }

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
