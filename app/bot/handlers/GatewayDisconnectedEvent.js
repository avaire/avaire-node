/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when login or gateway auth failed, or primary gateway
 * socket disconnects, closing all open sockets. Not emitted
 * if disconnected using client.disconnect().
 *
 * If the socket disconnected due to a loss of connection the
 * handler will try and auto reconnect to the gateway, if
 * that fails it will try and open a new connecction.
 *
 * @see http://qeled.github.io/discordie/#/docs/DISCONNECTED
 *
 * @extends {EventHandler}
 */
class GatewayDisconnectedEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        app.logger.error('Disonnected from the Discord gateway: ' + socket.error);

        if (socket.autoReconnect) {
            app.logger.error('Attemping to reconnect in ' + Math.ceil(socket.delay) + ' ms');
        }
    }
}

module.exports = GatewayDisconnectedEvent;
