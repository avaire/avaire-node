/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class FlushQueueCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('flushqueue', ['fqueue'], {
            allowDM: false,
            middleware: [
                'require:text.send_messages',
                'throttle.user:1,5',
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

        let queue = Music.getQueue(message);
        let songs = queue.length - 1;

        if (songs <= 0) {
            return app.envoyer.sendWarn(message, 'There are no songs pending in the queue right now.');
        }

        queue.splice(1, songs);
        return app.envoyer.sendInfo(message, 'I have removed **:songs** songs from the playlist, the queue is now empty!', {
            songs
        });
    }
}

module.exports = FlushQueueCommand;
