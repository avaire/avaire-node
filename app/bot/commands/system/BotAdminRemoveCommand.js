/** @ignore */
const Command = require('./../Command');

class BotListRemoveCommand extends Command {
    constructor() {
        super(';', 'bar', [], {
            middleware: [
                'isBotAdmin'
            ]
        });
    }

    onCommand(sender, message, args) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'language.errors.missing-arguments', {
                command: this.getPrefix() + this.getTriggers()[0]
            });
        }

        let index = app.config.botAccess.indexOf(args[0]);
        if (index <= -1) {
            return app.envoyer.sendWarn(message, 'Invalid user id given, the user ID was not found in the bot administrative list');
        }

        delete app.config.botAccess[index];
        return app.envoyer.sendInfo(message, '`:botid` has been removed from the bot administrative list.', {
            botid: args[0]
        });
    }
}

module.exports = BotListRemoveCommand;
