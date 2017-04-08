/** @ignore */
const Command = require('./../Command');

class InviteCommand extends Command {
    constructor() {
        super('!', 'invite', ['join'], {
            description: [
                'Tells you about what commands the bot has, what they do and how you can use them.'
            ]
        });
    }

    onCommand(sender, message, args) {
        return app.envoyer.sendInfo(message, 'commands.general.invite.message', {
            oauth: app.config.bot.oauth
        });
    }
}

module.exports = InviteCommand;
