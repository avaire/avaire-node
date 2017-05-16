/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const JoinMessageHandler = require('./utils/JoinLeaveMessageHandler');

/**
 * Emitted after a member has been added to a new guild.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_MEMBER_ADD
 *
 * @extends {EventHandler}
 */
class GuildMemberAddEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        return JoinMessageHandler.send(socket, socket.member, 'welcome', 'Welcome %user% to **%server%!**')
                                 .catch(err => app.logger.error(err));
    }
}

module.exports = new GuildMemberAddEvent;
