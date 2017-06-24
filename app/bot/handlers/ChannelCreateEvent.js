/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const Handler = require('./utils/UpdateGuildChannelsHandler');

/**
 * Emitted after a channel has been created in a guild/server.
 *
 * @see http://qeled.github.io/discordie/#/docs/CHANNEL_CREATE
 *
 * @extends {EventHandler}
 */
class ChannelCreateEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket}  socket  The Discordie gateway socket.
     * @return {mixed}
     */
    handle(socket) {
        return Handler.handle(socket);
    }
}

module.exports = new ChannelCreateEvent;
