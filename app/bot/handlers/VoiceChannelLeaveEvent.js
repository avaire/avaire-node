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
        if (socket.user.bot && socket.user.id !== bot.User.id) {
            return;
        }

        let mockMessage = {
            guild: {id: socket.channel.guild_id}
        };

        if (Music.getQueue(mockMessage).length === 0) {
            return;
        }

        let connectedUsers = socket.channel.members;
        if (this.isThereAnyNoneBotsInVoiceChannel(connectedUsers)) {
            return;
        }

        if (!this.isBotConnected(connectedUsers)) {
            return;
        }

        Music.pauseStream(mockMessage);
        app.cache.put(`is-alone-in-voice.${socket.channel.guild_id}`, new Date, 600, 'memory');
    }

    /**
     * Checks to see if there is any users in the members array that aren't a bot.
     *
     * @param  {Array}  members  The array of members that should be checked.
     * @return {Boolean}
     */
    isThereAnyNoneBotsInVoiceChannel(members) {
        for (let i in members) {
            if (!members[i].bot) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if the bot is a part of the array of members.
     *
     * @param  {Array}  members  The array of members that should be checked.
     * @return {Boolean}
     */
    isBotConnected(members) {
        for (let id in members) {
            if (members[id].id === bot.User.id) {
                return true;
            }
        }

        return false;
    }
}

module.exports = new VoiceChannelLeaveEvent;
