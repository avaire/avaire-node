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
            let guildId = connection.voiceSocket.guildId;

            if (!app.cache.has(`is-alone-in-voice.${guildId}`, 'memory')) {
                continue;
            }

            let cacheTime = app.cache.get(`is-alone-in-voice.${guildId}`, undefined, 'memory');
            let inactiveTime = new Date(cacheTime.getTime() + (1000 * 450)); // 7 minutes and 30 seconds.

            if (inactiveTime >= new Date) {
                continue;
            }

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

            connection.voiceConnection.channel.leave();
            Music.forcefullyDeletePlaylist(guildId);
        }
    }
}

module.exports = InactiveVoiceStreamJob;
