/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class VolumeCommand extends Command {
    constructor() {
        super('!', 'volume', ['vol'], {
            allowDM: false,
            middleware: [
                'throttle.channel:2,4'
            ],
            description: 'Use this to change the volume of the music that\'s playing.'
        });
    }

    onCommand(sender, message, args) {
        if (app.bot.maintenance) {
            return app.envoyer.sendWarn(message, 'Going down for maintenance, you can\'t change the volume right now!');
        }

        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'language.errors.missing-arguments', {
                command: this.getPrefix() + this.getTriggers()[0]
            });
        }

        if (!Music.userHasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-role');
        }

        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-connection');
        }

        if (Music.getPlaylist(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.empty-playlist');
        }

        let volume = Math.max(Math.min(parseInt(args[0], 10), 100), 0);
        Music.setVolume(message, volume);

        let volumeString = '';
        for (let i = 1; i <= 10; i++) {
            volumeString += (i - 1) * 10 < volume ? '▒' : '░';
        }

        return app.envoyer.sendInfo(message, `🎵 Volume set to **${volume}%**\n${volumeString}`).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return message.delete().catch(err => app.logger.error(err));
            }, 6500);
        });
    }
}

module.exports = VolumeCommand;
