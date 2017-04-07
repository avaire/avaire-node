/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class PauseCommand extends Command {
    constructor() {
        super('!', 'pause', [], {
            allowDM: false,
            middleware: [
                'throttle.channel:2,5'
            ],
            description: 'Pauses the song that is currently playing.'
        });
    }

    onCommand(sender, message, args) {
        if (!Music.userHasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-role');
        }

        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-connection');
        }

        if (Music.getPlaylist(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.pauseresume.pause-on-empty');
        }

        Music.pauseStream(message);
        return app.envoyer.sendSuccess(message, 'commands.music.pauseresume.paused');
    }
}

module.exports = PauseCommand;
