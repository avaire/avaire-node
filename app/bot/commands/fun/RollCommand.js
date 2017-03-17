/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class RollCommand extends Command {
    constructor() {
        super('>', 'roll', [], {
            description: 'Rolls a random number or a set of D&D dice.'
        });
    }

    onCommand(sender, message, args) {
        if (args.length > 0 && /[0-9]+d+[0-9]+/ig.test(args[0])) {
            return this.rollDice(message, args);
        }

        return this.rollNumber(message, args);
    }

    rollNumber(message, args) {
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
            number: random,
            min: min,
            max: max
        });
    }

    rollDice(message, args) {
        let dice = args[0];

        request('https://rolz.org/api/?' + dice + '.json', function (error, response, body) {
            if (error || response.statusCode !== 200) {
                return message.channel.sendMessage('The API returned an unconventional response.');
            }

            try {
                let roll = JSON.parse(body);

                return app.envoyer.sendSuccess(message, 'commands.fun.roll.dice', {
                    dice: roll.input.toUpperCase(),
                    result: roll.result,
                    details: roll.details
                });
            } catch (err) {
                return message.channel.sendMessage('The API returned an unconventional response.');
            }
        });
    }
}

module.exports = RollCommand;
