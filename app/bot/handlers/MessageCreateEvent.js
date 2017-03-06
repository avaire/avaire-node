/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a user sends a text message in any valid text channel in a guild.
 * 
 * @extends {EventHandler}
 */
class MessageCreateEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     * 
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        let message = socket.message.content;
        let author  = socket.message.author;

        app.logger.info(`${author.username}#${author.discriminator} said: ${message}`);
    }
}

module.exports = MessageCreateEvent;
