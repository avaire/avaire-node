/** @ignore */
const Command = require('./../Command');

class PingCommand extends Command {
    constructor() {
        super('!', 'ping', ['pingme'], {
            middleware: [
                'throttle.user:2,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        let time = new Date(message.timestamp);

        return app.envoyer.sendSuccess(message, '<@:userid>, Pong!').then(sentMessage => {
            let diff = Math.floor(new Date(sentMessage.timestamp) - time);

            sentMessage.edit('',
                app.envoyer.transform('success',
                    app.lang.formatResponse(message, `<@:userid>, Pong! Time taken: ${diff} ms.`)
                )
            );
        });
    }
}

module.exports = PingCommand;
