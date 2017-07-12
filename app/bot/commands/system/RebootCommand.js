/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./../music/MusicHandler');

class RebootCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('reboot', ['restart'], {
            middleware: [
                'isBotAdmin'
            ]
        });

        this.rebootMessage = 'https://media.senither.com/avaire-maintenance-message.mp3';
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
        app.bot.maintenance = true;

        // If we don't have any voice connections active the bot will just kill it's processes.
        if (bot.VoiceConnections.length === 0) {
            app.envoyer.sendInfo(message, 'Rebooting processes, cya in a few seconds!');

            return this.shutdown();
        }

        app.envoyer.sendWarn(message, 'There are currently `:connections` voice connections active, sending maintenance voice message and waiting for connections to end...', {
            connections: bot.VoiceConnections.length
        });

        for (let id in bot.VoiceConnections) {
            let connection = bot.VoiceConnections[id];
            let guildId = app.getGuildIdFrom(connection);

            if (Music.getQueue(guildId).length === 0) {
                continue;
            }

            // Flushes the queue of any extra songs that might be in the
            // queue and add our reboot message to the queue instead.
            Music.setQueue(guildId, Music.getQueue(guildId).slice(0, 1));
            Music.getQueue(guildId).push({
                title: 'AvaIre Maintenance Message',
                duration: '5',
                url: this.rebootMessage,
                link: 'https://github.com/AvaIre/AvaIre',
                requester: sender
            });
            Music.setVolume(guildId, 65);

            // Shifts the queue so the new reboot message is first and call
            // the music Next method to start playing the announcement.
            Music.getQueue(guildId).shift();
            Music.next(guildId, false);
        }

        // Waits 5 seconds, and then checks every half second if there are still
        // any active voice connections, if the voice connections array is
        // empty the process will exit and restart the application.
        let shouldSendmessage = true;
        app.scheduler.scheduleRepeatingTask(() => {
            if (bot.VoiceConnections.length === 0) {
                if (shouldSendmessage) {
                    shouldSendmessage = false;
                    app.envoyer.sendInfo(message, 'All voice connections has ended, rebooting processes, cya in a few seconds!');
                }

                return this.shutdown();
            }
        }, 5000, 500);

        // If there are still linging connections after 30 seconds will just kill the processes anyway.
        return app.scheduler.scheduleDelayedTask(() => this.shutdown(), 30000);
    }

    shutdown() {
        bot.disconnect();

        return app.scheduler.scheduleDelayedTask(() => process.exit(0), 1500);
    }
}

module.exports = RebootCommand;
