/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class EightBallCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('8ball', [], {
            middleware: [
                'throttle.user:1,1'
            ]
        });

        /**
         * A list of answers that the 8ball can respond with.
         *
         * @type {Array}
         */
        this.answers = [
            'It is certain',
            'It is decidedly so',
            'Without a doubt',
            'Yes definitely',
            'You may rely on it',
            'As I see it, yes',
            'Most likely',
            'Outlook good',
            'Yes',
            'Signs point to yes',
            'Reply hazy try again',
            'Ask again later',
            'Better not tell you now',
            'Cannot predict now',
            'Concentrate and ask again',
            'Don\'t count on it',
            'My reply is no',
            'My sources say no',
            'Outlook not so good',
            'Very doubtful'
        ];
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
        return app.envoyer.sendEmbededMessage(message, {
            color: 0x2A2C31,
            description: `🎱 ${this.randomAnswer}`
        });
    }

    /**
     * Suffles the array of answers, then picks a random
     * index from the array, returning a random answer.
     *
     * @return {String}
     */
    get randomAnswer() {
        return _.shuffle(this.answers)[
            Math.floor(
                Math.random() * (this.answers.length - 1)
            )
        ];
    }
}

module.exports = EightBallCommand;
