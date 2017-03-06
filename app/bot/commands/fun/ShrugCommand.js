/** @ignore */
const Command = require('./../Command');

class ShrugCommand extends Command {
    constructor() {
        super('>', 'shrug', [], {
            description: '¯\\_(ツ)_/¯'
        });
    }

    onCommand(sender, message, args) {
        return message.reply('¯\\_(ツ)_/¯');
    }
}

module.exports = ShrugCommand;
