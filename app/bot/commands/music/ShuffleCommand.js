/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class ShuffleCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('shuffle', [], {
            allowDM: false,
            middleware: [
                'require:text.send_messages',
                'throttle.channel:2,4',
                'hasRole:DJ'
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
        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-connection');
        }

        if (Music.getQueue(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.empty-queue');
        }

        if (!Music.isInSameVoiceChannelAsBot(message, sender)) {
            return app.envoyer.sendWarn(message, 'commands.music.volume-while-not-in-channel').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return app.envoyer.delete(message);
                }, 10000);
            });
        }

        let queue = Music.getQueue(message);
        let index = queue.length;

        // Shuffles all but the first index in the music queue
        // array, using the Fisher–Yates shuffle algorithm.
        while (index !== 0) {
            let random = Math.floor(Math.random() * index);
            index -= 1;

            if (index !== 0 && random !== 0) {
                let temporaryValue = queue[index];

                queue[index] = queue[random];
                queue[random] = temporaryValue;
            }
        }

        Music.queues[app.getGuildIdFrom(message)] = queue;

        return app.envoyer.sendSuccess(message, 'commands.music.shuffle.on-shuffle');
    }
}

module.exports = ShuffleCommand;
