/** @ignore */
const Command = require('./../Command');

class RollCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('roll', [], {
            description: 'Rolls a random number.',
            usage: [
                '[min] [max]'
            ]
        });
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
        let min = 1;
        let max = 100;

        if (args.length === 1 && args[0].length !== 0 && !isNaN(args[0])) {
            max = parseInt(args[0], 10);
        } else if (args.length > 1 && !isNaN(args[0]) && !isNaN(args[1])) {
            min = parseInt(args[0], 10);
            max = parseInt(args[1], 10);
        }

        min = Math.ceil(min);
        max = Math.floor(max);

        let random = Math.floor(Math.random() * (max - min + 1)) + min;

        return app.envoyer.sendSuccess(message, 'commands.fun.roll.number', {
            number: random, min, max
        });
    }
}

module.exports = RollCommand;
