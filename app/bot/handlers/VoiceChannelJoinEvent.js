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

        if (Music.getQueue(app.getGuildIdFrom(socket)).length === 0) {
            return;
        }

        if (this.getNumberOfUsersInVoiceChannel(socket.channel) > 1) {
            return;
        }

        if (!this.isBotConnected(socket.channel.members)) {
            return;
        }

        Music.unpauseStream(app.getGuildIdFrom(socket));
        app.cache.forget(`is-alone-in-voice.${app.getGuildIdFrom(socket)}`, 'memory');
    }

    /**
     * Gets the number of non-bot users in teh same voice channel as the bot
     *
     * @param  {IChannel}  channel  The voice channel instance.
     * @return {Number}
     */
    getNumberOfUsersInVoiceChannel(channel) {
        let users = 0;

        channel.members.forEach(member => {
            return member.bot ? users : users++;
        });
        return users;
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

module.exports = new VoiceChannelJoinEvent;
