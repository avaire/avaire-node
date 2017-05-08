/** @ignore */
const Middleware = require('./Middleware');

/**
 * Makes sure that the user that executed the command for
 * the middleware has the provided list of permissions.
 *
 * @extends {Middleware}
 */
class RequireUser extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket} request      Discordie message create socket
     * @param  {Closure}       next         The next request in the stack
     * @param  {Array}         permissions  List of permissions that should be checked
     * @return {mixed}
     */
    handle(request, next, ...permissions) {
        if (request.message.isPrivate) {
            return next(request);
        }

        for (let i in permissions) {
            let permission = permissions[i];

            if (app.permission.userHas(request.message, permission)) {
                continue;
            }

            return app.envoyer.sendWarn(request.message, 'language.errors.require-user-missing', {permission});
        }

        return next(request);
    }
}

module.exports = RequireUser;
