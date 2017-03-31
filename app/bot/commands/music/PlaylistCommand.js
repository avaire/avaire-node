/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class PlaylistCommand extends Command {
    constructor() {
        super('!', 'playlist', ['list'], {
            allowDM: false,
            middleware: [
                'throttle.user:2,5'
            ],
            description: 'Lists all the song currently in the playlist.'
        });
    }

    onCommand(sender, message, args) {
        if (!Music.isConnectedToVoice(message)) {
            return this.sendPlaylistIsEmpty(message);
        }

        let playlist = Music.getPlaylist(message);
        if (playlist.length === 0) {
            return this.sendPlaylistIsEmpty(message);
        }

        let song = playlist[0];
        let embed = {
            color: app.envoyer.colors.info,
            title: app.lang.get(message, 'commands.music.playlist.currently-playing'),
            description: app.lang.get(message, 'commands.music.playlist.playing'),
            fields: [
                {
                    name: app.lang.get(message, 'commands.music.playlist.in-queue'),
                    value: app.lang.get(message, 'commands.music.playlist.empty-playlist')
                }
            ]
        };

        if (playlist.length > 1) {
            let queue = '';

            for (let i = 1; i < Math.min(playlist.length, 6); i++) {
                queue += `**${i}:** [${playlist[i].title.limit(64)}](${playlist[i].link}) [${playlist[i].duration}]\n`;
            }

            if (playlist.length > 6) {
                let length = playlist.length - 6;

                let langType = (length === 1) ? 'singular' : 'plural';

                queue += '\n' + app.lang.get(message, 'commands.music.playlist.extra-' + langType, {
                    number: length
                });
            }

            embed.fields[0].value = queue.trim();
        }

        return app.envoyer.sendEmbededMessage(message, embed, {
            link: song.link,
            title: song.title,
            volume: Music.getVolume(message),
            time: this.getTimeLeft(song.playTime, song.duration),
            requester: `<@${song.requester.id}>`
        }).then(m => {
            return app.scheduler.scheduleDelayedTask(() => m.delete(), 29500);
        });
    }

    sendPlaylistIsEmpty(message) {
        return app.envoyer.sendWarn(message, 'commands.music.empty-playlist').then(m => {
            return app.scheduler.scheduleDelayedTask(() => m.delete(), 6000);
        });
    }

    getTimeLeft(played, time, multiplier = 1) {
        let split = time.split(':');
        let seconds = 0;

        while (split.length > 0) {
            seconds += multiplier * parseInt(split.pop(), 10);
            multiplier *= 60;
        }

        let secondsLeft = seconds - played;

        let h = Math.floor((secondsLeft % 86400) / 3600);
        let m = Math.floor(((secondsLeft % 86400) % 3600) / 60);

        time = m + ':' + Math.floor(((secondsLeft % 86400) % 3600) % 60);

        if (h > 0) {
            time = h + ':' + time;
        }

        return Music.formatDuration(time);
    }
}

module.exports = PlaylistCommand;
