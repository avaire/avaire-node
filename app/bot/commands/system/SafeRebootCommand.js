/** @ignore */
const Command = require('./../Command');

class SafeRebootCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('safereboot', ['sreboot'], {
            description: [
                'Reboots the bot and all of its processes safely.'
            ],
            middleware: [
                'isBotAdmin'
            ]
        });

        this.isRunning = false;
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
        if (this.isRunning) {
            return app.envoyer.sendWarn(message, 'The safe reboot process has already started, there are currently **:connections** active, once they drop the bot will restart', {
                connections: bot.VoiceConnections.length
            });
        }

        app.envoyer.sendInfo(message, 'Safebooting process has started!\nThe bot will auto restart as soon as all active voice connections are droped.');

        this.isRunning = true;
        // Runs immediately, and every half second after that if there are still
        // any active voice connections, if the voice connections array is
        // empty the process will exit and execute the reboot command.
        let shouldContinue = true;
        app.scheduler.scheduleRepeatingTask(() => {
            if (bot.VoiceConnections.length === 0 && shouldContinue) {
                shouldContinue = false;
                app.bot.commands.RebootCommand.handler.onCommand(sender, message, []);
            }
        }, 0, 500);
    }
}

module.exports = SafeRebootCommand;
