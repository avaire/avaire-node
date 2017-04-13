/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

/**
 * Emitted when a user leaves a voice channel.
 *
 * @extends {EventHandler}
 */
class VoiceChannelLeaveEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        let mockMessage = {
            guild: {id: socket.channel.guild_id}
        };

        let playlist = Music.getPlaylist(mockMessage);
        if (playlist.length === 0) {
            return;
        }

        let connectedUsers = socket.channel.members;
        if (connectedUsers.length !== 1) {
            return;
        }

        if (connectedUsers[0].id !== bot.User.id) {
            return;
        }

        Music.pauseStream(mockMessage);
        app.cache.forever(`is-alone-in-voice.${socket.channel.guild_id}`, new Date, 'memory');
    }
}

module.exports = VoiceChannelLeaveEvent;
