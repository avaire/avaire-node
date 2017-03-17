/** @ignore */
const Command = require('./../Command');

class BlahCommand extends Command {
    constructor() {
        super('>', 'blah', [], {
            description: 'Blah?'
        });
    }

    onCommand(sender, message, args) {
        return app.envoyer.sendSuccess(message, 'commands.fun.blah');
    }
}

module.exports = BlahCommand;
