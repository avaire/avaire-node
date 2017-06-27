/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a voice socket disconnects.
 *
 * @see http://qeled.github.io/discordie/#/docs/VOICE_DISCONNECTED
 *
 * @extends {EventHandler}
 */
class VoiceDisconnectedEvent extends EventHandler {

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

module.exports = new VoiceDisconnectedEvent;
