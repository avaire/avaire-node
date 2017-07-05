/** @ignore */
const _ = require('lodash');
/** @ignore */
const Middleware = require('./../Middleware');

/**
 * Processes the command, executing the command logic, this
 * middleware needs to be added to the compiled resolved
 * list of middlewares for every command, and it has to
 * be the last index of the array.
 *
 * @extends {Middleware}
 */
class CanSendMessagesMiddleware extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket}  request  Discordie message create socket
     * @param  {Closure}        next     The next request in the stack
     * @return {mixed}
     */
    handle(request, next) {
        if (request.message.isPrivate) {
            return next(request);
        }

        if (this.canSendMessages(request.message)) {
            return next(request);
        }

        return request.message.author.openDM().then(message => {
            return app.envoyer.sendWarn(message, app.lang.get(request.message, 'language.errors.require-command-perms'));
        });
    }

    canSendMessages(message) {
        return app.permission.botHas(message, 'text.send_messages') &&
               app.permission.botHas(message, 'text.embed_links');
    }
}

module.exports = CanSendMessagesMiddleware;
