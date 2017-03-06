/** @ignore */
const Command = require('./../Command');

class PingCommand extends Command {
    constructor() {
        super('!', 'ping', ['pingme']);
    }

    onCommand(sender, message, args) {
        let time = new Date(message.timestamp);
        
        message.reply('Pong!').then((message) => {
            let diff = Math.floor(new Date(message.timestamp) - time);
            message.edit(`<@${sender.id}>, Pong! Time taken: ${diff} ms.`);
        });
    }
}

module.exports = PingCommand;
