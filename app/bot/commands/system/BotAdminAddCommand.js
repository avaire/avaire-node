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
