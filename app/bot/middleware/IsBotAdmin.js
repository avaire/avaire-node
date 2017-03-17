/** @ignore */
const Middleware = require('./Middleware');

/**
 * Checks if the user that is executing the command
 * for the middleware is a bot admin.
 *
 * @extends {Middleware}
 */
class IsBotAdmin extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket} request  Discordie message create socket
     * @param  {Closure}       next     The next request in the stack
     * @return {mixed}
     */
    handle(request, next) {
        if (this.isBotAdmin(request.message.author)) {
            return next(request);
        }

        return app.envoyer.sendError(request.message, 'language.errors.must-be-bot-admin');
    }

    /**
     * Checks if the users id is in the "botAccess" property in the config.json file.
     *
     * @param  {IUser}    author  Discordie user object
     * @return {Boolean}          Returns ture if the user is a bot admin
     */
    isBotAdmin(author) {
        for (let index in app.config.botAccess) {
            if (author.id === app.config.botAccess[index]) {
                return true;
            }
        }

        return false;
    }
}

module.exports = IsBotAdmin;
