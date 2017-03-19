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

        if (typeof apiToken !== 'string' && apiToken.length === 32) {
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
        app.logger.info(`Executing AI Request <${socket.message.resolveContent()}> from ${socket.message.author.username}`);

        // TODO: Extract this into its own method so it can be used easier, the same logic is also used in the MessageCreateEvent handler.
        // Possibly make a helper class/object on the app global so it can be called easily with app.helper.isBotTagedIn(message) or something along those lines.
        message = _.replace(message, `<@${bot.User.id}>`, '');
        message = _.replace(message, `<@!${bot.User.id}>`, '');

        // Creates the API text request and sends it off to API.AI, the users id is used as
        // the session id so the AIs can differentiate between the incomming text requests.
        let request = this.getService().textRequest(message, {
            sessionId: socket.message.author.id
        });

        request.on('response', response => {
            // If the reponse action is a smalltalk action we'll just send it directly back to the user.
            if (_.startsWith(response.result.action, 'smalltalk.')) {
                return app.envoyer.sendSuccess(socket.message, response.result.fulfillment.speech);
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
}

module.exports = AIServiceProvider;
