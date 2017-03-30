/** @ignore */
const _ = require('lodash');
/** @ignore */
const Middleware = require('./Middleware');

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
     * @param  {GatewaySocket} socket   Discordie message create socket
     * @param  {Closure}       next     The next request in the stack
     * @param  {Command}       command  The command that is about to be executed
     * @return {mixed}
     */
    handle(socket, next) {
        let user = socket.message.author;

        app.logger.info(`Executing Command <${socket.message.resolveContent()}> from ${user.username}#${user.discriminator}`);
        app.bot.statistics.commands++;

        return this.command.handler.onCommand(
            user, socket.message, _.drop(socket.message.content.trim().split(' ')), socket
        );
    }
}

module.exports = ProcessCommand;
