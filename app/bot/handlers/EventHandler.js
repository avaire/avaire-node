/**
 * The "abstract" event handler class, the entire class just work as
 * a palceholder for Discord event handlers, by default the handler
 * won't do anyhting, child instacnes of the event handler can
 * overwrite the handle method to run event-based logic.
 *
 * @abstract
 */
class EventHandler {
    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handler(socket) {
        //
    }
}

module.exports = EventHandler;
