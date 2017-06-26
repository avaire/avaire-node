/** @ignore */
const _ = require('lodash');
/** @ignore */
const apiai = require('apiai');
/** @ignore */
const Intents = require('./Intents');
/** @ignore */
const ServiceProvider = require('./../ServiceProvider');

/**
 * API.AI Service provider, this service provider will allow
 * to application to interact with the AIs on api.ai.
 *
 * @extends {ServiceProvider}
 */
class AIServiceProvider extends ServiceProvider {

    /**
     * Registers the service provider.
     *
     * @return {Boolean}
     */
    register() {
        let apiToken = app.config.apiKeys.apiai;

        if ((typeof apiToken !== 'string') || apiToken.length !== 32) {
            return false;
        }

        return this.setService(apiai(apiToken));
    }

    /**
     * Sends a text request to API.AI.
     *
     * @param  {GatewaySocket} socket   Discordie message create socket
     * @param  {String}        message  The message that should be sent to the API
     * @return {undefined}
     */
    textRequest(socket, message) {
        let author = socket.message.author;
        app.logger.info(`Executing AI Request <${socket.message.resolveContent()}> from ${author.username}#${author.discriminator}`);

        // Creates the API text request and sends it off to API.AI, the users id is used as
        // the session id so the AIs can differentiate between the incomming text requests.
        let request = this.getService().textRequest(message.replaceBotWith(), {
            sessionId: socket.message.author.id
        });

        request.on('response', response => {
            // If the reponse action is a smalltalk action we'll just send it directly back to the user.
            if (_.startsWith(response.result.action, 'smalltalk.')) {
                return this.handleSmalltalkIntent(socket, response);
            }

            // If the response action isn't a smalltalk action we'll try and find it in
            // the intents object list, if the handler is found a new instance will
            // be created of it with the current message properties.
            try {
                let IntentHandler = Intents[response.result.action].handler;

                let intent = new IntentHandler(socket, response, message);

                return intent.handle();
            } catch (err) {
                app.logger.error('An API.AI error has occurred for the following intent: ' + response.result.action);
                app.logger.error(err);
            }
        });

        request.on('error', err => {
            app.logger.error(err);
        });

        return request.end();
    }

    /**
     * Handles the smalltalk AI intent.
     *
     * @param  {GatewaySocket}  socket    Discordie message create socket.
     * @param  {TextRequest}    response  The AI text request response.
     * @return {Promise}
     */
    handleSmalltalkIntent(socket, response) {
        let speech = response.result.fulfillment.speech;

        let nickname = socket.message.author.username;
        if (!socket.message.isPrivate && socket.message.member.nick !== null) {
            nickname = socket.message.member.nick;
        }

        speech = speech.replace(/%user%/gi, socket.message.author.username);
        speech = speech.replace(/%nick%/gi, nickname);

        return app.envoyer.sendSuccess(socket.message, speech);
    }
}

module.exports = AIServiceProvider;
