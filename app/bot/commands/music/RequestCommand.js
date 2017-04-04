/** @ignore */
const URL = require('url');
/** @ignore */
const YouTubeDL = require('youtube-dl');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class RequestCommand extends Command {
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

    onCommand(sender, message, args) {
        if (app.bot.maintenance) {
            return app.envoyer.sendWarn(message, 'Going down for maintenance, you can\'t request songs right now!');
        }

        if (args.length === 0) {
            return app.envoyer.sendError(message, 'commands.music.require.error');
        }

        return Music.prepareVoice(message).then(() => {
            message.channel.sendTyping();

            let url = args.join(' ');

            this.fetchSong(message, url).then(song => {
                let playlistLength = Music.getPlaylist(message).length;

                if (song.hasOwnProperty('webpage_url')) {
                    url = song.webpage_url;
                }

                let formats = song.formats.filter(format => {
                    return format.ext === 'webm' && format.abr > 0;
                }).sort((a, b) => a.abr - b.abr);

                let audio = formats.find(format => format.abr > 0 && !format.tbr) ||
                            formats.find(format => format.abr > 0);

                if (audio !== undefined) {
                    song.url = audio.url;
                }

                Music.addToPlaylist(message, song, url);

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

    fetchSong(message, url) {
        return new Promise((resolve, reject) => {
            let parsedUrl = URL.parse(url);
            let options = ['--skip-download', '-f bestaudio/worstvideo'];

            if (url.indexOf('youtu') > -1 || parsedUrl.host === null) {
                options.push('--add-header', 'Authorization:' + app.config.apiKeys.google);
            }

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
