/** @ignore */
const Command = require('./../Command');

class BotAdminListCommand extends Command {
    constructor() {
        super(';', 'bal', [], {
            middleware: [
                'isBotAdmin'
            ]
        });
    }

    onCommand(sender, message, args) {
        let admins = [];
        for (let id in app.config.botAccess) {
            admins.push(`<@${app.config.botAccess[id]}> (${app.config.botAccess[id]})`);
        }

        return app.envoyer.sendInfo(message, admins.join('\n'));
    }
}

module.exports = BotAdminListCommand;
