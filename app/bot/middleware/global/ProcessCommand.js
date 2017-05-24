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
            user, socket.message, this.buildCommandArguments(socket), socket
        );
    }

    /**
     * Builds the command arguments array.
     *
     * @param  {GatewaySocket}  socket  Discordie message create socket.
     * @return {Array}
     */
    buildCommandArguments(socket) {
        let rawArguments = _.drop(
            socket.message.content.trim().split(' ')
        ).join(' ').match(/[^\s"]+|"([^"]*)"/gi);

        // If our raw arguments is null we can assume the regex
        // failed to find any matches and therefor there
        // where no arguments parsed to the command.
        if (rawArguments === null) {
            return [];
        }

        let args = [];
        let skipNext = false;
        for (let i = 0; i < rawArguments.length; i++) {
            if (skipNext) {
                continue;
            }

            // If any of our arguments are wraped in quote marks
            // we'll strip the quote marks off to make the
            // output in the other end a bit cleaner.
            let arg = rawArguments[i];
            if (_.startsWith(arg, '"') && _.endsWith(arg, '"')) {
                arg = arg.substr(1, arg.length - 2);
            }

            // If the following character is a comma we'll append it
            // to our current string and skip it in the next loop.
            if (_.startsWith(rawArguments[i + 1], ',')) {
                arg += rawArguments[i + 1];
                skipNext = true;
            }

            args.push(arg);
        }

        return args;
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

    /**
     * Prettify the contents of the socket.
     *
     * @param  {GatewaySocket}  socket  Discordie message create socket
     * @return {String}
     */
    prettifyContent(socket) {
        return socket.message.resolveContent().replace(/\n/g, '\\n');
    }
}

module.exports = ProcessCommand;
