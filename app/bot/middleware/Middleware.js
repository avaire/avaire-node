/**
 * The "abstract" middleware class, the entire class just work as a palceholder
 * for propper middlewares until logic for the handler is filled out.
 *
 * @abstract
 */
class Middleware {

    /**
     * Setups the middleware
     *
     * @param {Middleware} nextMiddleware  The next middleware in the stack
     * @param {Array}      params          The parameters that should be parsed to the middleware
     * @param {Command}    command         The command the middleware was triggered for
     */
    constructor(nextMiddleware, params, command) {
        /**
         * The next middleware that should be called in the stack.
         *
         * @type {Middleware}
         */
        this.nextMiddleware = nextMiddleware;

        /**
         * The parameters that should be accessable inside the middleware.
         *
         * @type {Array}
         */
        this.params = params;

        /**
         * The command the middleware was invoked for.
         *
         * @type {Command}
         */
        this.command = command;
    }

    /**
     * Handles the incomming command request
     *
     * @param  {GatewaySocket} request  Discordie message create socket
     * @param  {Command}       next     The next request in the stack
     * @param  {Array}         args     An array of options parsed to the middleware
     * @return {Boolean}
     */
    handle(request, next, ...args) {
        return next(request);
    }

    /**
     * Calls the next middleware in the stack
     *
     * @param  {GatewaySocket} request  Discordie message create socket
     * @return {mixed}
     */
    next(request) {
        let middleware = this.nextMiddleware;

        if (middleware === undefined) {
            app.logger.error(`${this.constructor.name} failed to call the next middleware in the stack, middleware is undefined!`);
            app.logger.error('Request:');
            app.logger.error(request);
            return null;
        }

        return middleware.handle(request, middleware.next.bind(middleware), ...this.params);
    }
}

module.exports = Middleware;
