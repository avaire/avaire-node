/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class VolumeCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('volume', ['vol'], {
            allowDM: false,
            middleware: [
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

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

        // Gets the volume that the music stream should be
        // set to, limiting to a number between 0 and 100.
        let volume = Math.max(Math.min(parseInt(args[0], 10), 100), 0);
        Music.setVolume(message, volume);

        let volumeString = '';
        for (let i = 1; i <= 10; i++) {
            volumeString += (i - 1) * 10 < volume ? '▒' : '░';
        }

        return app.envoyer.sendInfo(message, `🎵 Volume set to **${volume}%**\n${volumeString}`).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return app.envoyer.delete(message);
            }, 6500);
        });
    }
}

module.exports = VolumeCommand;
