/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./Module');

class GoodbyeMessageCommand extends Command {
    constructor() {
        super('.', 'goodbyemessage', ['byemsg'], {
            allowDM: false,
            description: 'Sets the goodbye message.',
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
        let goodbyeMessage = null;
        if (args.length > 0) {
            goodbyeMessage = args.join(' ');
        }

        return Module.setProperty(message, 'goodbye', ['message'], [goodbyeMessage]).then(() => {
            let type = goodbyeMessage === null ? 'default' : 'message';
            return app.envoyer.sendSuccess(message, 'commands.administration.modules.messages.set-' + type, {
                module: 'goodbye',
                message: goodbyeMessage
            });
        }).catch(err => {
            if (err.message === 'disabled') {
                return app.envoyer.sendWarn(message, 'commands.administration.modules.not-enabled', {
                    module: 'goodbye',
                    command: '.goodbye'
                });
            }

            return app.envoyer.error(err);
        });
    }
}

module.exports = GoodbyeMessageCommand;
