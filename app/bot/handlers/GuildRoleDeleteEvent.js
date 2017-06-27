/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a role has been deleted for a guild/server.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_ROLE_DELETE
 *
 * @extends {EventHandler}
 */
class GuildRoleDeleteEvent extends EventHandler {

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

module.exports = new GuildRoleDeleteEvent;
