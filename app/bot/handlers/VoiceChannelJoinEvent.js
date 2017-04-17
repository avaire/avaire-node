/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

/**
 * Emitted when a user joins a voice channel.
 *
 * @extends {EventHandler}
 */
class VoiceChannelJoinEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        if (socket.user.bot && socket.user.id !== bot.User.id) {
            return;
        }

        let mockMessage = {
            guild: {id: socket.channel.guild_id}
        };

        let playlist = Music.getPlaylist(mockMessage);
        if (playlist.length === 0) {
            return;
        }

        if (!VoiceChannelJoinEvent.prototype.isBotConnected(socket.channel.members)) {
            return;
        }

        Music.unpauseStream(mockMessage);
        app.cache.forget(`is-alone-in-voice.${socket.channel.guild_id}`, 'memory');
    }

    /**
     * Checks if the bot is a part of the array of users.
     *
     * @param  {Array}  users  The array of users that should be checked.
     * @return {Boolean}
     */
    isBotConnected(users) {
        for (let id in users) {
            if (users[id].id === bot.User.id) {
                return true;
            }
        }

        return false;
    }
}

module.exports = VoiceChannelJoinEvent;
