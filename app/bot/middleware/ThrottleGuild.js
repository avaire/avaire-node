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
        let key = `throttle-guild.${request.message.guild.id}.${this.command.name}`;

        if (app.throttle.can(key, maxAttempts, decaySeconds)) {
            return next(request);
        }

        let expireTime = app.throttle.getThrottleItem(key).expire;
        let secondsLeft = Math.ceil((expireTime - new Date) / 1000);
        let command = this.getCommandTrigger();

        return app.envoyer.sendWarn(request.message, 'language.errors.throttle-limit-hit', {
            command: command,
            seconds: secondsLeft
        }).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return message.delete();
            }, 4500);
        });
    }

    /**
     * Gets the commands main command trigger.
     *
     * @return {String}
     */
    getCommandTrigger() {
        return this.command.handler.getPrefix() + this.command.handler.getTriggers()[0];
    }
}

module.exports = ThrottleGuild;
