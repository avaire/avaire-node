/** @ignore */
const Command = require('./../Command');

class SourceCommand extends Command {
    constructor() {
        super('!', 'source', ['sourcecode'], {
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

        let command = this.getCommand(args[0]);

        if (command === null) {
            return app.envoyer.sendInfo(message, 'Invalid command given, here is the full source instead.\n\n' + this.rootUrl);
        }

        return app.envoyer.sendInfo(message, 'AvaIre source code for the **:command** command:\n\n' + this.commandUrl, {
            commandfile: command.name,
            category: command.category,
            command: args[0].toLowerCase()
        });
    }

    /**
     * Gets the command with matching triggers to what the user sent.
     *
     * TODO: This is a copy of the getCommand method from the MessageCreateEvent
     * class, since this method is now used in multiple placed it should
     * be refactored into it's own class/handler.
     *
     * @param  {String} message  The message that was sent by the user.
     * @return {Command|null}
     */
    getCommand(message) {
        let trigger = message.toLowerCase();

        for (let commandName in app.bot.commands) {
            let command = app.bot.commands[commandName];

            for (let triggerIndex in command.triggers) {
                if (trigger === command.prefix + command.triggers[triggerIndex]) {
                    return command;
                }
            }
        }

        return null;
    }
}

module.exports = SourceCommand;
