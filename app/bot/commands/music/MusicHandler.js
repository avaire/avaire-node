/** @ignore */
const _ = require('lodash');

/**
 * Music Handler, allows for easy management of music and
 * voice using streams for Discord voice channels.
 */
class MusicHandler {

    /**
     * Setups and prepares the Music Handler.
     */
    constructor() {
        /**
         * The music playlist and song queue.
         *
         * @type {Object}
         */
        this.playlist = {};

        /**
         * The music volume for guilds.
         *
         * @type {Object}
         */
        this.volume = {};

        /**
         * The music playback state for guilds.
         *
         * @type {Object}
         */
        this.paused = {};

        /**
         * The channel id the music was requested in for the guilds.
         *
         * @type {Object}
         */
        this.channel = {};

        /**
         * A list of unnecessary properties that should be
         * removed if they're found in the song objects.
         *
         * @type {Array}
         */
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

    /**
     * Adds a song to the playlist.
     *
     * @param {IMessage}  message  The Discordie message object.
     * @param {Object}    song     The requested song object.
     * @param {[type}     link     The link to the song.
     */
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

        if (!this.paused.hasOwnProperty(message.guild.id)) {
            this.paused[message.guild.id] = false;
        }

        if (!this.channel.hasOwnProperty(message.guild.id)) {
            this.channel[message.guild.id] = message.channel.id;
        }

        this.unnecessaryProperties.forEach(property => {
            if (song.hasOwnProperty(property)) {
                delete song[property];
            }
        });

        this.playlist[message.guild.id].push(song);
    }

    /**
     * Gets the current playlist.
     *
     * @param  {IMessage} message  The Discordie message object.
     * @return {Object}
     */
    getPlaylist(message) {
        if (!_.isObjectLike(this.playlist[message.guild.id])) {
            this.playlist[message.guild.id] = [];
        }

        return this.playlist[message.guild.id];
    }

    /**
     * Prepares the voice channel for music streaming by making sure the bot
     * is can and is connectet to the voice channel the user is connected
     * to, it returns a promise that is resolved when the bot has
     * successfully connected to the voice channel.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {Promise}
     */
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

    /**
     * Loads the next song in the playlist, if the playlist is empty the
     * voice channel stream will be droped and the bot will disconnect.
     *
     * @param  {IMessage}  message       The Discordie message object.
     * @param  {Boolean}   sendMessages  Determines if the messages should be sent.
     * @return {Function}
     */
    next(message, sendMessages = true) {
        let connection = this.getVoiceConnection(message);

        if (connection !== undefined) {
            if (this.getPlaylist(message).length === 0) {
                this.forcefullyDeletePlaylist(message.guild.id);

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

    /**
     * Sets the volume of the current stream for the provided guild.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @param  {Integer}   volume   The volume the stream should be set to.
     */
    setVolume(message, volume) {
        this.volume[message.guild.id] = volume;

        return this.getVoiceConnection(message)
                   .voiceConnection.getEncoder().setVolume(volume);
    }

    /**
     * Gets the current stream volume, if the guild isn't found in
     * the volume list the default(50) will be returned instead.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {Integer}
     */
    getVolume(message) {
        if (!this.volume.hasOwnProperty(message.guild.id)) {
            return 50;
        }
        return this.volume[message.guild.id];
    }

    /**
     * Gets the id of the channel the music was requested in.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {String|undefined}
     */
    getChannelId(message) {
        return this.channel[message.guild.id];
    }

    /**
     * Checks if the bot is connected to a voice channel.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {Boolean}
     */
    isConnectedToVoice(message) {
        return this.getVoiceConnection(message) !== undefined;
    }

    /**
     * Sets the current paused state.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @param  {Boolean}   state    The pause state that should be set.
     */
    setPausedState(message, state) {
        this.paused[message.guild.id] = state;
    }

    /**
     * Returns the current paused state.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {Boolean}
     */
    isPaused(message) {
        if (this.paused.hasOwnProperty(message.guild.id)) {
            return this.paused[message.guild.id];
        }
        return false;
    }

    /**
     * Pauses the current stream.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {[type]}
     */
    pauseStream(message) {
        this.setPausedState(message, true);

        return this.getVoiceConnection(message)
                   .voiceConnection
                   .getEncoderStream()
                   .cork();
    }

    /**
     * Unpauses the current stream.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {[type]}
     */
    unpauseStream(message) {
        this.setPausedState(message, false);

        return this.getVoiceConnection(message)
                   .voiceConnection
                   .getEncoderStream()
                   .uncork();
    }

    /**
     * Gets the current voice connection, if no connection
     * is found undefined will be returned instead.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {VoiceConnectionInfo|undefined}
     */
    getVoiceConnection(message) {
        return bot.VoiceConnections.find(voice => {
            return voice.voiceSocket.guildId === message.guild.id;
        });
    }

    /**
     * Checks if the guild member has the DJ role.
     *
     * @param  {IGuildMember}  member The Discordie guild member object.
     * @return {Boolean}
     */
    userHasDJRole(member) {
        return member.roles.find(role => {
            return role.name.toUpperCase() === 'DJ';
        }) !== undefined;
    }

    /**
     * Formats the given duration to look nicer.
     *
     * @param  {String} duration  The duration that should be formatted.
     * @return {String}
     */
    formatDuration(duration) {
        let split = duration.split(':');

        for (let i = 1; i < split.length; i++) {
            if (split[i].length < 2) {
                split[i] = `0${split[i]}`;
            }
        }

        return split.join(':');
    }

    /**
     * Greacefully reject a promise.
     *
     * @param  {Function}  reject        The promise reject function.
     * @param  {String}    message       The message that should be used when the promise is rejeccted.
     * @param  {Object}    placeholders  The placeholders that should be formatted into the message.
     * @return {Promise}
     */
    gracefullReject(reject, message, placeholders = {}) {
        return reject({
            message,
            placeholders
        });
    }

    /**
     * Forcefully deletes the playlist, volume, and
     * paused state of the parsed guilds data.
     *
     * @param {String}  guildId  The id of the guild that should be deleted.
     */
    forcefullyDeletePlaylist(guildId) {
        delete this.playlist[guildId];
        delete this.channel[guildId];
        delete this.volume[guildId];
        delete this.paused[guildId];
    }
}

module.exports = new MusicHandler;
