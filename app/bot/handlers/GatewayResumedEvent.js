/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after gateway connection is resumed after a disconnect.
 * Connections can be resumable if disconnected for short period
 * of time, this does not clear cache unlike {GatewayReadyEvent}.
 *
 * @see http://qeled.github.io/discordie/#/docs/GATEWAY_RESUMED
 *
 * @extends {EventHandler}
 */
class GatewayResumedEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        app.logger.info('Discord gateway connection has been resumed!');
    }
}

module.exports = GatewayResumedEvent;
