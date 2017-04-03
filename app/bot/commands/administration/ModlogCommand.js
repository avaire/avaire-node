/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./Module');

class ModlogCommand extends Command {
    constructor() {
        super('.', 'modlog', ['mlog'], {
            allowDM: false,
            description: 'Toggles the ModLog module on or off for the current channel.',
            middleware: [
                'require:general.manage_server',
                'throttle.guild:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        return Module.toggle(message, 'modlog', 'ModLog');
    }
}

module.exports = ModlogCommand;
