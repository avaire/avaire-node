/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a guild/server becomes unavailable
 * due to server outage or other server issues.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_UNAVAILABLE
 *
 * @extends {EventHandler}
 */
class GuildUnavailableEvent extends EventHandler {

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

module.exports = new GuildUnavailableEvent;
