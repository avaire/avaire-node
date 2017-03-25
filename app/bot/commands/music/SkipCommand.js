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
            ]
        });
    }

    onCommand(sender, message, args) {
        if (!this.hasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.skip.missing-role');
        }

        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.skip.missing-connection');
        }

        if (Music.getPlaylist(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.skip.empty-playlist');
        }

        Music.getPlaylist(message).shift();
        return Music.next(message);
    }

    hasDJRole(member) {
        return member.roles.find(role => {
            return role.name.toUpperCase() === 'DJ';
        }) !== undefined;
    }
}

module.exports = SkipCommand;
