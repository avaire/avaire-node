/** @ignore */
const _ = require('lodash');

class MusicHandler {
    constructor() {
        this.playlist = {};
    }

    addToPlaylist(message, song, link) {
        if (!_.isObjectLike(this.playlist[message.guild.id])) {
            this.playlist[message.guild.id] = [];
        }

        song.link = link;
        song.requester = message.author;
        song.duration = this.formatDuration(song.duration);

        this.playlist[message.guild.id].push(song);
    }

    getPlaylist(message) {
        if (!_.isObjectLike(this.playlist[message.guild.id])) {
            this.playlist[message.guild.id] = [];
        }

        return this.playlist[message.guild.id];
    }

    prepareVoice(message) {
        return new Promise((resolve, reject) => {
            if (this.isConnectedToVoice(message)) {
                return resolve();
            }

            let user = message.guild.members.find(guildUser => {
                return guildUser.id === message.author.id;
            });

            if (user.getVoiceChannel() === null) {
                return this.gracefullReject(reject, 'commands.music.voice-required');
            }

            this.playlist[message.guild.id] = [];

            user.getVoiceChannel().join().then(() => resolve()).catch(err => {
                if (err.message === 'Missing permission') {
                    return this.gracefullReject(reject, 'commands.music.missing-permissions');
                }
            });
        });
    }

    next(message) {
        let connection = this.getVoiceConnection(message);

        if (connection !== undefined) {
            if (this.playlist[message.guild.id].length === 0) {
                delete this.playlist[message.guild.id];

                app.envoyer.sendInfo(message, 'commands.music.end-of-playlist').then(m => {
                    return app.scheduler.scheduleDelayedTask(() => m.delete(), 7500);
                });

                return connection.voiceConnection.disconnect();
            }

            let song = this.playlist[message.guild.id][0];

            if (song.url === 'INVALID') {
                this.playlist[message.guild.id].shift();

                return this.next(message);
            }

            var encoder = connection.voiceConnection.createExternalEncoder({
                type: 'ffmpeg',
                format: 'pcm',
                source: song.url
            });

            encoder.play();

            app.envoyer.sendInfo(message, 'commands.music.now-playing', {
                title: song.title,
                duration: this.formatDuration(song.duration),
                link: song.link
            });

            encoder.once('end', () => {
                this.playlist[message.guild.id].shift();
                return this.next(message);
            });
        }
    }

    isConnectedToVoice(message) {
        return this.getVoiceConnection(message) !== undefined;
    }

    getVoiceConnection(message) {
        return bot.VoiceConnections.find(voice => {
            return voice.voiceSocket.guildId === message.guild.id;
        });
    }

    formatDuration(duration) {
        let split = duration.split(':');

        for (let i = 1; i < split.length; i++) {
            if (split[i].length < 2) {
                split[i] = `0${split[i]}`;
            }
        }

        return split.join(':');
    }

    gracefullReject(reject, message, placeholders = {}) {
        return reject({
            message: message,
            placeholders: placeholders
        });
    }
}

module.exports = new MusicHandler;
