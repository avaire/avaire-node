/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class PurgeCommand extends Command {
    constructor() {
        super('.', 'purge', ['clear'], {
            description: 'Deletes up to 100 chat messages in any channel, you can mention a user if you only want to delete messages by the mentioned user.',
            middleware: [
                'throttle.channel:1,5',
                'require:text.manage_messages'
            ]
        });
    }

    onCommand(sender, message, args) {
        if (args.length === 0) {
            return message.channel.sendMessage(':warning: Missing arguments, use `.help .purge` to learn more about the command');
        }

        // Limits the amount of messages that can be deleted per command to 1,000
        let amount = Math.min(Math.max(parseInt(args[0], 10), 1) + 1, 1000);

        return this.deleteMessages(message.channel, amount).then(amountOfDeletedMessages => {
            return message.channel.sendMessage(':white_check_mark: `' + amountOfDeletedMessages + '` messages has been deleted!').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return message.delete();
                }, 3500);
            });
        }).catch(err => {
            app.logger.error(err);
            return message.channel.sendMessage(':warning: ' + err.response.res.body.message);
        });
    }

    deleteMessages(channel, left, deletedMessages = 0) {
        return channel.fetchMessages(Math.min(left, 100)).then(result => {
            return bot.Messages.deleteMessages(result.messages).then(() => {
                deletedMessages += result.messages.length;

                // Checks to see if we have more messages that needs to be deleted, and if the result from
                // the last request to the Discord API returned less then what we requested for, if
                // that is the case we can assume the channel doesn't have anymore messages.
                if (left > 100 && result.limit === 100 && result.limit === result.messages.length) {
                    return this.deleteMessages(channel, left - 100, deletedMessages);
                }

                return deletedMessages;
            });
        });
    }
}

module.exports = PurgeCommand;
