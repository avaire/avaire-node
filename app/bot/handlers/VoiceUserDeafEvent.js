/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when user deaf change is detected. Global server-side deafen.
 *
 * @see http://qeled.github.io/discordie/#/docs/VOICE_USER_DEAF
 *
 * @extends {EventHandler}
 */
class VoiceUserDeafEvent extends EventHandler {

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

module.exports = new VoiceUserDeafEvent;
