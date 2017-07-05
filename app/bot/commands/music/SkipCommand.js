/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class SkipCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('skip', [], {
            allowDM: false,
            middleware: [
                'throttle.user:2,5',
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
            return app.envoyer.sendWarn(message, 'commands.music.skip-while-not-in-channel').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return app.envoyer.delete(message);
                }, 10000);
            });
        }

        let song = Music.getQueue(message).shift();
        if (Music.isRepeat(message)) {
            Music.getQueue(message).push(song);
        }

        return Music.next(message);
    }
}

module.exports = SkipCommand;
