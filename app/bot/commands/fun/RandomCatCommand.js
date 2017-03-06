/** @ignore */
const Command = require('./../Command');
const request = require('request');

class RandomCatCommand extends Command {
    constructor() {
        super('>', 'randomcat', ['cat'], {
            description: 'I will get a random cat for you'
        });
    }

    onCommand(sender, message, args) {
        request('http://random.cat/meow', function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    let parsed = JSON.parse(body);
                    
                    message.channel.sendMessage(parsed.file);
                } catch (e) {
                    message.channel.sendMessage('The API returned an unconventional response.');
                    app.logger.error(e);
                }
            }
        });
    }
}

module.exports = RandomCatCommand;
