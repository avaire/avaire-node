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

    onCommand(sender, message, args) {
        return Module.toggle(message, 'goodbye', 'Goodbye');
    }
}

module.exports = GoodbyeCommand;
