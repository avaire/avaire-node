/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./../music/MusicHandler');

class RebootCommand extends Command {
    constructor() {
        super(';', 'reboot', ['restart'], {
            middleware: [
                'isBotAdmin'
            ]
        });

        this.rebootMessage = 'https://media.senither.com/avaire-maintenance-message.mp3';
    }

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
            let guildId = connection.voiceSocket.guildId;

            // Flushes the playlist of any extra songs that might be in the
            // queue and add our reboot message to the queue instead.
            Music.playlist[guildId] = Music.playlist[guildId].slice(0, 1);
            Music.playlist[guildId].push({
                title: 'AvaIre Maintenance Message',
                duration: '5',
                url: this.rebootMessage,
                link: 'https://github.com/senither/AvaIre/',
                requester: sender
            });
            Music.volume[guildId] = 65;

            // Shifts the playlist so the new reboot message is first and call
            // the music Next method to start playing the announcement.
            Music.playlist[guildId].shift();
            Music.next({
                guild: {
                    id: guildId
                }
            }, false);
        }

        // Waits 5 seconds, and then checks every half second if there are still
        // any active voice connections, if the voice connections array is
        // empty the process will exit and restart the application.
        app.scheduler.scheduleRepeatingTask(() => {
            if (bot.VoiceConnections.length === 0) {
                app.envoyer.sendInfo(message, 'All voice connections has ended, rebooting processes, cya in a few seconds!');

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
