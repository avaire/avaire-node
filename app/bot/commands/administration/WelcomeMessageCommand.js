/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/ChannelModule');

/**
 * Welcome Merssage Command, allows server managers to set the welcome
 * message that should be used when someone joins the guild.
 *
 * @extends {Command}
 */
class WelcomeMessageCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('.', 'welcomemessage', ['welmsg'], {
            allowDM: false,
            description: 'Sets the welcome message.',
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
