/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/ChannelModule');

/**
 * Goodbye Merssage Command, allows server managers to set the goodbye
 * message that should be used when someone leaves the guild.
 *
 * @extends {Command}
 */
class GoodbyeMessageCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('goodbyemessage', ['byemsg'], {
            allowDM: false,
            description: 'Sets the goodbye message.',
            usage: [
                '',
                '[message]'
            ],
            middleware: [
                'require.user:general.manage_server',
                'throttle.guild:1,5'
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
