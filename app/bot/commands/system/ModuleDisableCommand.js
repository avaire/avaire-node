/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const categories = require('./../Categories');
/** @ignore */
const Moddules = require('./../Modules');

class ModuleDisableCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('md', [], {
            description: 'Disable a given module',
            usage: '<module>',
            middleware: [
                'isBotAdmin'
            ]
        });
    }

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        let category = categories.find(category => {
            return _.startsWith(category.toLowerCase(), args[0].toLowerCase());
        });

        if (typeof category === 'undefined') {
            return app.envoyer.sendWarn(message, 'Invalid module given, `:category` is not a valid module', {category});
        }

        Moddules.setStatues(category.toLowerCase(), false);

        return app.envoyer.sendSuccess(message, 'The `:category` module is now `disabled`.', {category});
    }
}

module.exports = ModuleDisableCommand;
