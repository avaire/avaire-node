/** @ignore */
const Middleware = require('./Middleware');

/**
 * Throttles the command for the user that executed it.
 *
 * @extends {Middleware}
 */
class ThrottleUser extends Middleware {

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
        let key = `throttle-user.${request.message.guild.id}.${request.message.author.id}.${this.getCommand().name}`;

        if (app.throttle.can(key, maxAttempts, decaySeconds)) {
            return next(request);
        }

        let expireTime = app.throttle.getThrottleItem(key).expire;
        let secondsLeft = Math.ceil((expireTime - new Date) / 1000);
        let command = this.getCommandTrigger();

        let message = app.lang.get(request.message.channel, 'language.errors.throttle-limit-hit', {
            command: command,
            seconds: secondsLeft
        });

        return request.message.reply(message).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return message.delete();
            }, 4500);
        });
    }

    /**
     * Gets the command the middleware was invoked by.
     *
     * @return {Command}
     */
    getCommand() {
        return this.params[0];
    }

    /**
     * Gets the commands main command trigger.
     *
     * @return {String}
     */
    getCommandTrigger() {
        return this.getCommand().handler.getPrefix() + this.getCommand().handler.getTriggers()[0];
    }
}

module.exports = ThrottleUser;
