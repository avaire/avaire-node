
/**
 * The "abstract" intent handler class, the class will take in the message
 * properties from the AI service provider and the MessageCreateEvent
 * and make them easily available to AI intents.
 *
 * @abstract
 */
class IntentHandler {

    /**
     * Prepares the ai intent.
     *
     * @param  {GatewaySocket} socket    Discordie message create socket
     * @param  {TextRequest}   response  The AI text request response
     * @param  {String}        message   The message that was sent to the AI
     */
    constructor(socket, response, message) {
        /**
         * The Discordie gateway socket from the MessageCreate event.
         *
         * @type {GatewaySocket}
         */
        this.socket = socket;

        /**
         * The text request response from the API.AI library, this can be
         * used to access what kind of message was sent, and some
         * fallback responses to the type of message.
         *
         * @type {TextRequest}
         */
        this.response = response;

        /**
         * The message that was sent off to the API.ai service.
         *
         * @type {String}
         */
        this.message = message;
    }

    /**
     * Gets the Discordie message object from the socket.
     *
     * @return {IMessage}
     */
    getMessage() {
        return this.socket.message;
    }

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     *
     * @throws {Error} If the method is not overwritten.
     */
    handle() {
        throw new Error('#handle() is not implemented for the intent handler');
    }
}

module.exports = IntentHandler;
