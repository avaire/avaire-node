/** @ignore */
const request = require('request');
/** @ignore */
const Job = require('./Job');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

/**
 * Inactive Voice Stream job, this job runs every minute, every cycle the job will
 * go through all the voice connections and make sure they're still active and
 * being used(atleast one person is listening to the music), if no one is
 * listening and it's been too long the connection will be droped.
 *
 * @extends {Job}
 */
class InactiveVoiceStreamJob extends Job {

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        for (let id in bot.VoiceConnections) {
            let connection = bot.VoiceConnections[id];
            let guildId = app.getGuildIdFrom(connection);

            if (Music.paused.hasOwnProperty(guildId) && Music.paused[guildId] !== false) {
                // If the bot has been paused in a voice channel for 15 minutes
                // or more the connection will be droped for inactivity.
                let pausedAtDate = Music.paused[guildId].getTime() + (1000 * 60 * 15);
                if (pausedAtDate < new Date) {
                    this.disconnectFromVoice(connection, guildId);

                    continue;
                }
            }

            if (!app.cache.has(`is-alone-in-voice.${guildId}`, 'memory')) {
                this.processVoiceConnection(connection, guildId);

                continue;
            }

            let cacheTime = app.cache.get(`is-alone-in-voice.${guildId}`, undefined, 'memory');
            let inactiveTime = new Date(cacheTime.getTime() + (1000 * 450)); // 7 minutes and 30 seconds.

            if (inactiveTime >= new Date) {
                continue;
            }

            this.disconnectFromVoice(connection, guildId);
        }
    }

    /**
     * Processes the voice connection, checking if there is anyone in the bots
     * voice channel, and if there isn't any the bot should disconnect.
     *
     * @param  {VoiceConnectionInfo}  connection  The voice connection info object for the given voice channel.
     * @param  {String}               guildId     The id of the guild the channel belongs to.
     * @return {Boolean}
     */
    processVoiceConnection(connection, guildId) {
        if (this.isThereAnyNoneBotsInVoiceChannel(connection)) {
            return true;
        }

        let token = `inactive-voice-stream.${guildId}`;

        if (!app.cache.has(token, 'memory')) {
            app.cache.put(token, new Date, 180, 'memory');

            return false;
        }

        app.cache.forget(token, 'memory');

        return this.disconnectFromVoice(connection, guildId);
    }

    /**
     * Disconnects the bot from the given voice channel, if the ITextChannel that is associate with the music
     * queue is valid, the `disconnect-due-to-inactivity` message will be sent in the ITextChannel.
     *
     * @param  {VoiceConnectionInfo}  connection  The voice connection info object for the given voice channel.
     * @param  {String}               guildId     The id of the guild the channel belongs to.
     * @return {Boolean}
     */
    disconnectFromVoice(connection, guildId) {
        let channelId = Music.getChannelId({guild: {id: guildId}});

        let channel = connection.voiceConnection
                                .guild
                                .textChannels
                                .find(textChannel => textChannel.id === channelId);

        if (typeof channel !== 'undefined') {
            let local = app.lang.getLocal(guildId, false);
            let entity = app.lang.findLangEntity(`${local}.commands.music.disconnect-due-to-inactivity`);

            app.envoyer.sendInfo(channel, entity);
        }

        let voiceChannel = app.loadProperty(connection, ['voiceConnection', 'channel']);
        if (voiceChannel === null) {
            return false;
        }

        voiceChannel.leave();
        return Music.forcefullyDeleteQueue(guildId);
    }

    /**
     * Checks to see if there is any users in the members array that aren't a bot.
     *
     * @param  {VoiceConnectionInfo}  connection  The voice connection info object.
     * @return {Boolean}
     */
    isThereAnyNoneBotsInVoiceChannel(connection) {
        let members = app.loadProperty(connection, ['voiceConnection', 'channel', 'members']);
        if (!members === null) {
            // There might not be any users in the channel but we'll return true anyway
            // since droping the music mid-playing if there were an error somewhere
            // else would be kinda shit for the users listening to music.
            return true;
        }

        for (let i in members) {
            if (!members[i].bot) {
                return true;
            }
        }
        return false;
    }
}

module.exports = InactiveVoiceStreamJob;
