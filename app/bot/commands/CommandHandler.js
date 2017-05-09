/** @ignore */
let categories = require('./Categories');

/**
 * Command handler, allows for easy access
 * to any command in the registry.
 */
class CommandHandler {

    /**
     * Gets the command with matching triggers to what the user sent.
     *
     * @param  {String} message  The message that was sent by the user.
     * @return {Command|null}
     */
    getCommand(message) {
        let trigger = message.split(' ')[0].toLowerCase();

        for (let commandName in app.bot.commands) {
            let command = app.bot.commands[commandName];

            for (let triggerIndex in command.triggers) {
                if (trigger === command.prefix + command.triggers[triggerIndex]) {
                    return command;
                }
            }
        }

        return null;
    }

    /**
     * Gets the global command prefix for the given module name.
     *
     * @param {String}  module  The name of the module.
     * @return {String|null}
     */
    getGlobalPrefix(module) {
        for (let i in categories) {
            let category = categories[i];

            if (category.name.toLowerCase() === module.toLowerCase()) {
                return category.prefix;
            }
        }
        return null;
    }
}

module.exports = new CommandHandler;
