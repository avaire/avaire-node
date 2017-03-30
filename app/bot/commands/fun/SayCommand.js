/** @ignore */
const Command = require('./../Command');

class RollCommand extends Command {
    constructor() {
        super('>', 'say', ['echo'], {
            description: 'I will say anything you want'
        });
    }

    onCommand(sender, message, args) {
        if (message.isPrivate) {
            return message.channel.sendMessage(args.join(' '));
        }

        message.delete().then(() => {
            message.channel.sendMessage(args.join(' '));
        }).catch(err => {
            app.logger.error(err);
        });
    }
}

module.exports = RollCommand;
