/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./Module');

class WelcomeMessageCommand extends Command {
    constructor() {
        super('.', 'welcomemessage', ['welcomemsg', 'welmsg'], {
            allowDM: false,
            description: 'Sets the welcome message.',
            usage: [
                '',
                '[message]'
            ],
            middleware: [
                'require:general.manage_server',
                'throttle.guild:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        let welcomeMessage = null;
        if (args.length > 0) {
            welcomeMessage = args.join(' ');
        }

        return Module.setProperty(message, 'welcome', ['message'], [welcomeMessage]).then(() => {
            let type = welcomeMessage === null ? 'default' : 'message';
            return app.envoyer.sendSuccess(message, 'commands.administration.modules.messages.set-' + type, {
                module: 'welcome',
                message: welcomeMessage
            });
        }).catch(err => {
            if (err.message === 'disabled') {
                return app.envoyer.sendWarn(message, 'commands.administration.modules.not-enabled', {
                    module: 'welcome',
                    command: '.welcome'
                });
            }

            return app.envoyer.error(err);
        });
    }
}

module.exports = WelcomeMessageCommand;
