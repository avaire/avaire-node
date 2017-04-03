/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./Module');

class AiCommand extends Command {
    constructor() {
        super('.', 'ai', [], {
            allowDM: false,
            description: 'Toggles the AI module on or off for the current channel.',
            middleware: [
                'require:general.manage_server',
                'throttle.guild:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        return Module.toggle(message, 'ai', 'AI');
    }
}

module.exports = AiCommand;
