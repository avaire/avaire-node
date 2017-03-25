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
        super('!', 'request', [], {
            middleware: [
                'throttle.user:2,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        return Music.prepareVoice(message).then(() => {
            message.channel.sendTyping();

            let url = args.join(' ');

            this.fetchSong(message, url).then(song => {
                let playlistLength = Music.getPlaylist(message).length;

                if (song.hasOwnProperty('webpage_url')) {
                    url = song.webpage_url;
                }

                Music.addToPlaylist(message, song, url);

                if (playlistLength === 0) {
                    Music.next(message);
                    return message.delete();
                }

                app.envoyer.sendInfo(message, '<@:userid> has added [:title](:link) to the queue.', {
                    title: song.title,
                    link: url
                }).then(() => message.delete());
            }).catch(err => {
                app.logger.error('Failed to add a song to the music playlist: ', err);

                return app.envoyer.sendError(message, 'I couldn\'t add that to the playlist.');
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
