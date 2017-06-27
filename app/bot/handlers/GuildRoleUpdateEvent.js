/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a role has been updated for a guild/server.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_ROLE_UPDATE
 *
 * @extends {EventHandler}
 */
class GuildRoleUpdateEvent extends EventHandler {

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

module.exports = new GuildRoleUpdateEvent;
