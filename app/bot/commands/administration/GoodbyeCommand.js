/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./Module');

class GoodbyeCommand extends Command {
    constructor() {
        super('.', 'goodbye', ['bye'], {
            allowDM: false,
            description: 'Toggles the goodbye module on or off for the current channel.',
            middleware: [
                'require:general.manage_server',
                'throttle.guild:1,5'
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
        return Module.toggle(message, 'goodbye', 'Goodbye');
    }
}

module.exports = GoodbyeCommand;
