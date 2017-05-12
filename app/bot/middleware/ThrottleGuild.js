/** @ignore */
const Middleware = require('./Middleware');

/**
 * Throttles the command for the guild it was executed in.
 *
 * @extends {Middleware}
 */
class ThrottleGuild extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @param  {GatewaySocket} request       Discordie message create socket
     * @param  {Closure}       next          The next request in the stack
     * @param  {Integer}       maxAttempts   The maxAttempts of commands that can be run within the timeout period
     * @param  {Integer}       decaySeconds  The decaySeconds period the user should be throttled for
     * @return {mixed}
     */
    handle(request, next, maxAttempts = 1, decaySeconds = 5) {
        let key = this.generateCacheToken(request);

        if (app.throttle.can(key, maxAttempts, decaySeconds)) {
            return next(request);
        }

        let expireTime = app.throttle.getThrottleItem(key).expire;
        let secondsLeft = Math.ceil((expireTime - new Date) / 1000);
        let command = this.getCommandTrigger(request.message);

        return app.envoyer.sendWarn(request.message, 'language.errors.throttle-limit-hit', {
            seconds: secondsLeft, command
        }).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return message.delete();
            }, 4500);
        });
    }

    /**
     * Gets the commands main command trigger.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {String}
     */
    getCommandTrigger(message) {
        return this.command.handler.getPrefix(message) + this.command.handler.getTriggers()[0];
    }

    /**
     * Generates the correct cache token for the middleware, if the message that invoked
     * the middleware is a DM(Direct Message) a globaly used cache token will be used
     * instead to share the throtteling between different throttle middlewares.
     *
     * @param  {GatewaySocket} request  Discordie message create socket
     * @return {String}
     */
    generateCacheToken(request) {
        if (request.message.isPrivate) {
            return `throttle-dm.${request.message.author.id}.${this.command.name}`;
        }

        return `throttle-guild.${request.message.guild.id}.${this.command.name}`;
    }
}

module.exports = ThrottleGuild;
