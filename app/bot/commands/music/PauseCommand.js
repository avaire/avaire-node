/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class PauseCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('pause', [], {
            allowDM: false,
            description: 'Pauses the song that is currently playing.',
            middleware: [
                'require:text.send_messages',
                'throttle.channel:2,5',
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
            return app.envoyer.sendWarn(message, 'commands.music.pauseresume.pause-on-empty');
        }

        if (Music.isPaused(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.pauseresume.is-paused');
        }

        Music.pauseStream(message);
        return app.envoyer.sendSuccess(message, 'commands.music.pauseresume.paused');
    }
}

module.exports = PauseCommand;
