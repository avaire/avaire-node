/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a new voice connection is fully initialized.
 *
 * @see http://qeled.github.io/discordie/#/docs/VOICE_CONNECTED
 *
 * @extends {EventHandler}
 */
class VoiceConnectedEvent extends EventHandler {

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

module.exports = new VoiceConnectedEvent;
