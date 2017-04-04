/** @ignore */
const _ = require('lodash');

class MusicHandler {
    constructor() {
        this.playlist = {};
        this.volume = {};
        this.unnecessaryProperties = [
            'asr',
            'abr',
            'tbr',
            'fps',
            'formats',
            'alt_title',
            'subtitles',
            'thumbnails',
            'description',
            'manifest_url',
            'automatic_captions'
        ];
    }

    addToPlaylist(message, song, link) {
        if (!_.isObjectLike(this.playlist[message.guild.id])) {
            this.playlist[message.guild.id] = [];
        }

        song.link = link;
        song.playTime = 0;
        song.requester = message.author;
        song.duration = this.formatDuration(song.duration);

        if (!this.volume.hasOwnProperty(message.guild.id)) {
            this.volume[message.guild.id] = 50;
        }

        this.unnecessaryProperties.forEach(property => {
            if (song.hasOwnProperty(property)) {
                delete song[property];
            }
        });

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

    next(message, sendMessages = true) {
        let connection = this.getVoiceConnection(message);

        if (connection !== undefined) {
            if (this.getPlaylist(message).length === 0) {
                delete this.playlist[message.guild.id];

                if (sendMessages) {
                    app.envoyer.sendInfo(message, 'commands.music.end-of-playlist').then(m => {
                        return app.scheduler.scheduleDelayedTask(() => m.delete(), 7500);
                    });
                }

                return connection.voiceConnection.disconnect();
            }

            let song = this.playlist[message.guild.id][0];

            if (song.url === 'INVALID') {
                this.playlist[message.guild.id].shift();

                return this.next(message, sendMessages);
            }

            let encoder = connection.voiceConnection.createExternalEncoder({
                type: 'ffmpeg',
                format: 'pcm',
                source: song.url
            });

            let encoderStream = encoder.play();
            let playlist = this.getPlaylist(message);

            encoderStream.resetTimestamp();
            encoderStream.removeAllListeners('timestamp');
            encoderStream.on('timestamp', time => {
                if (typeof playlist[0] !== 'undefined') {
                    playlist[0].playTime = Math.floor(time);
                }
            });

            let volume = this.volume[message.guild.id];
            connection.voiceConnection.getEncoder().setVolume(volume === undefined ? 50 : volume);

            if (sendMessages) {
                app.envoyer.sendInfo(message, 'commands.music.now-playing', {
                    title: song.title,
                    duration: this.formatDuration(song.duration),
                    link: song.link
                });
            }

            encoder.once('end', () => {
                this.playlist[message.guild.id].shift();
                return this.next(message, sendMessages);
            });
        }
    }

    setVolume(message, volume) {
        this.volume[message.guild.id] = volume;

        return this.getVoiceConnection(message)
                   .voiceConnection.getEncoder().setVolume(volume);
    }

    getVolume(message) {
        if (!this.volume.hasOwnProperty(message.guild.id)) {
            return 50;
        }
        return this.volume[message.guild.id];
    }

    isConnectedToVoice(message) {
        return this.getVoiceConnection(message) !== undefined;
    }

    getVoiceConnection(message) {
        return bot.VoiceConnections.find(voice => {
            return voice.voiceSocket.guildId === message.guild.id;
        });
    }

    userHasDJRole(member) {
        return member.roles.find(role => {
            return role.name.toUpperCase() === 'DJ';
        }) !== undefined;
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
            message,
            placeholders
        });
    }
}

module.exports = new MusicHandler;
