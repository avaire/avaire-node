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
     * Discordies event dispatcher requires a closure/function to be
     * parsed into it, so the constructor returns its own handler
     * method as a way to fulfill this requirement.
     *
     * @return {Function}
     */
    constructor() {
        return this.handle;
    }

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
