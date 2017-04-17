/** @ignore */
const URL = require('url');
/** @ignore */
const YouTubeDL = require('youtube-dl');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class RequestCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('!', 'request', ['play'], {
            allowDM: false,
            middleware: [
                'throttle.user:2,5'
            ],
            description: 'Use this to request songs from youtube, soundcloud or twitch streams.',
            usage: [
                '<link>',
                '<name of song>'
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
        if (app.bot.maintenance) {
            return app.envoyer.sendWarn(message, 'Going down for maintenance, you can\'t request songs right now!');
        }

        if (args.length === 0) {
            return app.envoyer.sendError(message, 'commands.music.require.error');
        }

        // Forces the bot into the same voice channel the user is connected to if the
        // bot isn't already connected to a voice channel for the given guild.
        return Music.prepareVoice(message).then(() => {
            message.channel.sendTyping();

            let url = args.join(' ');

            this.fetchSong(message, url).then(song => {
                let playlistLength = Music.getPlaylist(message).length;

                if (song.hasOwnProperty('webpage_url')) {
                    url = song.webpage_url;
                }

                // Filters through all of the song formants to make sure all the song
                // candidates is in a webm format and has an average audio bitrate
                // that's suitable for streaming via Discord.
                let formats = song.formats.filter(format => {
                    return format.ext === 'webm' && format.abr > 0;
                }).sort((a, b) => a.abr - b.abr);

                // Attempts to find the best bitrate audio version of the song.
                let audio = formats.find(format => format.abr > 0 && !format.tbr) ||
                            formats.find(format => format.abr > 0);

                if (audio !== undefined) {
                    song.url = audio.url;
                }

                Music.addToPlaylist(message, song, url);

                // If the playlist was empty before we'll force the bot to start
                // playing the song that was just requested immediately.
                if (playlistLength === 0) {
                    Music.next(message);
                    return message.delete();
                }

                app.envoyer.sendInfo(message, 'commands.music.require.added-song', {
                    title: song.title,
                    link: url
                }).then(() => message.delete());
            }).catch(err => {
                app.logger.error('Failed to add a song to the music playlist: ', err);

                return app.envoyer.sendError(message, 'commands.music.require.error');
            });
        }).catch(err => app.envoyer.sendWarn(message, err.message, err.placeholders));
    }

    /**
     * Attempts to fetch the song using the YouTubeDL library.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    url      The URl of the song that should be fetched.
     * @return {Promise}
     */
    fetchSong(message, url) {
        return new Promise((resolve, reject) => {
            let parsedUrl = URL.parse(url);
            let options = ['--skip-download', '-f bestaudio/worstvideo'];

            if (url.indexOf('youtu') > -1 || parsedUrl.host === null) {
                options.push('--add-header', 'Authorization:' + app.config.apiKeys.google);
            }

            // If the host of the given URL is invalid, the "url" will be formated to use
            // the YouTubeDl YouTube search format instead... What a sentence O.o
            if (parsedUrl.host === null) {
                url = 'ytsearch:' + url;
            }

            YouTubeDL.getInfo(url, options, {maxBuffer: 250000000}, (err, song) => {
                if (err) {
                    return reject(err);
                }

                return resolve(song);
            });
        });
    }
}

module.exports = RequestCommand;
