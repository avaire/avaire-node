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

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
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
