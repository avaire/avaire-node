/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when user mute change is detected. Global server-side mute.
 *
 * @see http://qeled.github.io/discordie/#/docs/VOICE_USER_MUTE
 *
 * @extends {EventHandler}
 */
class VoiceUserMuteEvent extends EventHandler {

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

module.exports = new VoiceUserMuteEvent;
