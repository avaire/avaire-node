/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class RandomCatCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('>', 'randomcat', ['cat'], {
            description: 'I will get a random cat for you',
            middleware: [
                'throttle.channel:1,1'
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
        request('http://random.cat/meow', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);

                    message.channel.sendMessage(parsed.file);
                } catch (err) {
                    message.channel.sendMessage('The API returned an unconventional response.');
                    app.logger.error(err);
                }
            }
        });
    }
}

module.exports = RandomCatCommand;
