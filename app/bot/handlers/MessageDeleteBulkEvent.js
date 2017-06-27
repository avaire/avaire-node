/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when Ava or another bot deletes more than one message at a time.
 *
 * @see http://qeled.github.io/discordie/#/docs/MESSAGE_DELETE_BULK
 *
 * @extends {EventHandler}
 */
class MessageDeleteBulkEvent extends EventHandler {

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

module.exports = new MessageDeleteBulkEvent;
