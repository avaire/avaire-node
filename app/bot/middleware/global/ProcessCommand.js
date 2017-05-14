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
class ProcessCommand extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket}  socket   Discordie message create socket
     * @param  {Closure}        next     The next request in the stack
     * @param  {Command}        command  The command that is about to be executed
     * @return {mixed}
     */
    handle(socket, next) {
        let user = socket.message.author;

        app.logger.info(`Executing Command <${this.prettifyContent(socket)}> from ${user.username}#${user.discriminator}`);

        this.incrementCommandCounterFor(this.command.handler.constructor.name);

        return this.command.handler.onCommand(
            user, socket.message, _.drop(socket.message.content.trim().split(' ')), socket
        );
    }

    /**
     * Prettify the contents of the socket.
     *
     * @param  {GatewaySocket}  socket  Discordie message create socket
     * @return {String}
     */
    prettifyContent(socket) {
        return socket.message.resolveContent()
                     .replace(/\n/g, '\\n');
    }

    /**
     * Increments the statistics for the given command.
     *
     * @param  {String}  command  The command name that should be incremented.
     * @return {mixed}
     */
    incrementCommandCounterFor(command) {
        app.bot.statistics.commands++;

        if (app.bot.statistics.commandUsage.hasOwnProperty(command)) {
            return app.bot.statistics.commandUsage[command]++;
        }
        app.bot.statistics.commandUsage[command] = 1;
    }
}

module.exports = ProcessCommand;
