/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class PlaylistCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('!', 'playlist', ['list'], {
            allowDM: false,
            description: 'Lists all the song currently in the playlist.',
            middleware: [
                'require:text.send_messages',
                'throttle.user:2,5'
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
        if (!Music.isConnectedToVoice(message)) {
            return this.sendPlaylistIsEmpty(message);
        }

        let playlist = Music.getPlaylist(message);
        if (playlist.length === 0) {
            return this.sendPlaylistIsEmpty(message);
        }

        // Begins building the embeded element that should be sent to the user.
        let song = playlist[0];
        let embed = {
            color: app.envoyer.colors.info,
            title: app.lang.get(message, 'commands.music.playlist.currently-' + (Music.isPaused(message) ? 'paused' : 'playing')),
            description: app.lang.get(message, 'commands.music.playlist.playing'),
            fields: [
                {
                    name: app.lang.get(message, 'commands.music.playlist.in-queue'),
                    value: app.lang.get(message, 'commands.music.playlist.empty-playlist')
                }
            ]
        };

        // If the playlist has more than one song the additional songs will added to the
        // embeded element showing the first six songs, and if there is more than six,
        // a message about how many more songs in the queue there are.
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
            requester: `<@${song.requester}>`
        }).then(m => {
            return app.scheduler.scheduleDelayedTask(() => m.delete(), 29500);
        });
    }

    /**
     * Send the music playlist is empty message, the
     * message will delete itself after 6 seconds.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    sendPlaylistIsEmpty(message) {
        return app.envoyer.sendWarn(message, 'commands.music.empty-playlist').then(m => {
            return app.scheduler.scheduleDelayedTask(() => m.delete(), 6000);
        });
    }

    /**
     * Gets the amount of time left of the current song.
     *
     * @param  {Number} played      The amount of time that has already been played.
     * @param  {String} time        The formating duration of the song.
     * @param  {Number} multiplier  The multiplier that should be used, defaults to 1.
     * @return {String}
     */
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
