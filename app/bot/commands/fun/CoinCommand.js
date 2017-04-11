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

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        return message.reply(this.images[Math.random() * 100 >= 50 ? 1 : 2]);
    }
}

module.exports = CoinCommand;
