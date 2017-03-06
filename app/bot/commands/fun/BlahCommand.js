/** @ignore */
const Command = require('./../Command');

class BlahCommand extends Command {
    constructor() {
        super('>', 'blah', [], {
            description: 'Blah?'
        });
    }

    onCommand(sender, message, args) {
        message.channel.sendMessage(`Blah to you too <@${message.author.id}>`);
    }
}

module.exports = BlahCommand;
