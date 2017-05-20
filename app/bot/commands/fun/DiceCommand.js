/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class DiceCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('dice', [], {
            description: 'Rolls a set of D&D dice.',
            usage: [
                '[D&D eg 4D8]'
            ],
            middleware: [
                'throttle.user:2,4'
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        let dice = args[0];

        request('https://rolz.org/api/?' + dice + '.json', (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return app.envoyer.sendNormalMessage(message, 'The API returned an unconventional response.');
            }

            try {
                let roll = JSON.parse(body);

                return app.envoyer.sendSuccess(message, 'commands.fun.roll.dice', {
                    dice: roll.input.toUpperCase(),
                    result: roll.result,
                    details: roll.details
                });
            } catch (err) {
                return app.envoyer.sendNormalMessage(message, 'The API returned an unconventional response.');
            }
        });
    }
}

module.exports = DiceCommand;
