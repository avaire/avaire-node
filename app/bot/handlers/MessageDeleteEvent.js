/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a user deletes a message or a bot deletes one message, the socket
 * message object can be null if the message haven't been cached yet.
 *
 * @see http://qeled.github.io/discordie/#/docs/MESSAGE_DELETE
 *
 * @extends {EventHandler}
 */
class MessageDeleteEvent extends EventHandler {

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

module.exports = new MessageDeleteEvent;
