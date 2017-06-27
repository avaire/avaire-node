/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a user updates their message, the socket message
 * object can be null if the message haven't been cached yet.
 *
 * @see http://qeled.github.io/discordie/#/docs/MESSAGE_UPDATE
 *
 * @extends {EventHandler}
 */
class MessageUpdateEvent extends EventHandler {

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

module.exports = new MessageUpdateEvent;
