/** @ignore */
const Middleware = require('./../Middleware');

/**
 * Maintenance Middleware, checks if the system is currently in maintenance mode,
 * if maintenance mode is enabled all commands will be disabled to prevent
 * anything from being queued and then cutoff if the system goes down.
 *
 * @extends {Middleware}
 */
class MaintenanceMiddleware extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket} request  Discordie message create socket
     * @param  {Closure}       next     The next request in the stack
     * @return {mixed}
     */
    handle(request, next) {
        if (!app.bot.maintenance) {
            return next(request);
        }

        return app.envoyer.sendWarn(request.message, 'Going down for maintenance, all commands has been disabled!');
    }
}

module.exports = MaintenanceMiddleware;
