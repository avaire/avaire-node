/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const LeaveMessageHandler = require('./utils/JoinLeaveMessageHandler');

/**
 * Emitted after a member has been removed/left a guild.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_MEMBER_REMOVE
 *
 * @extends {EventHandler}
 */
class GuildMemberRemoveEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        return LeaveMessageHandler.send(socket, socket.user, 'goodbye', '%user% has left **%server%**! :(')
                                  .catch(err => app.logger.error(err));
    }
}

module.exports = new GuildMemberRemoveEvent;
