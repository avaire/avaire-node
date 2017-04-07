/** @ignore */
const Command = require('./../Command');

class CoinCommand extends Command {
    constructor() {
        super('>', 'coin', [], {
            description: 'Flips a coin for heads or tails for you'
        });

        this.images = {
            1: 'https://cdn.discordapp.com/attachments/279462105277530112/279614727406223360/Heads.png',
            2: 'https://cdn.discordapp.com/attachments/279462105277530112/279614727431258112/Tails.png'
        };
    }

    onCommand(sender, message, args) {
        return message.reply(this.images[Math.random() * 100 >= 50 ? 1 : 2]);
    }
}

module.exports = CoinCommand;
