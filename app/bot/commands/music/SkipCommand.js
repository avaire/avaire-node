/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class SkipCommand extends Command {
    constructor() {
        super('!', 'skip', [], {
            allowDM: false,
            middleware: [
                'throttle.user:2,5'
            ],
            description: 'Use this to skip a song if you\'re not enjoing it.'
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
            return app.envoyer.sendWarn(message, 'commands.music.empty-playlist');
        }

        Music.getPlaylist(message).shift();
        return Music.next(message);
    }
}

module.exports = SkipCommand;
