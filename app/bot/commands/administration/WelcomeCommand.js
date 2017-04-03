/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./Module');

class WelcomeCommand extends Command {
    constructor() {
        super('.', 'welcome', ['wel'], {
            allowDM: false,
            description: 'Toggles the welcome module on or off for the current channel.',
            middleware: [
                'require:general.manage_server',
                'throttle.guild:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        return Module.toggle(message, 'welcome', 'Welcome');
    }
}

module.exports = WelcomeCommand;
