/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a user is unbanned from a guild/server.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_BAN_REMOVE
 *
 * @extends {EventHandler}
 */
class GuildBanRemoveEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket}  socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        //
    }
}

module.exports = new GuildBanRemoveEvent;
