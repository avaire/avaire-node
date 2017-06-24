/** @ignore */
const Middleware = require('./../Middleware');
/** @ignore */
const Modules = require('./../../commands/Modules');

/**
 * Maintenance Middleware, checks if the system is currently in maintenance mode,
 * if maintenance mode is enabled all commands will be disabled to prevent
 * anything from being queued and then cutoff if the system goes down.
 *
 * @extends {Middleware}
 */
class ModuleStatusMiddleware extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket}  request  Discordie message create socket
     * @param  {Closure}        next     The next request in the stack
     * @return {mixed}
     */
    handle(request, next) {
        if (this.shouldContinue(request)) {
            return next(request);
        }

        let user = request.message.author;
        app.logger.info(`Executing Command <${this.prettifyContent(request)}> from ${user.username}#${user.discriminator} | Module is disabled, command was canceled`);

        return app.envoyer.sendWarn(request.message, 'language.errors.module-is-disabled', {
            category: this.command.command.category
        }).then(message => app.scheduler.scheduleDelayedTask(() => message.delete(), 17500));
    }

    /**
     * Determines if the middleware should continue to the next
     * middleware in the stack or if it should be canceled.
     *
     * @param  {GatewaySocket}  request  Discordie message create socket
     * @return {Boolean}
     */
    shouldContinue(request) {
        if (Modules.isEnabled(this.command.command.category) || this.command.command.category === 'system') {
            return true;
        }

        return app.config.botAccess.indexOf(request.message.author.id) > -1;
    }

    /**
     * Prettify the contents of the request.
     *
     * @param  {GatewaySocket}  request  Discordie message create socket
     * @return {String}
     */
    prettifyContent(request) {
        return request.message.resolveContent().replace(/\n/g, '\\n');
    }
}

module.exports = ModuleStatusMiddleware;
