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
        super('!', 'shuffle', [], {
            allowDM: false,
            description: 'Use this to shuffle the songs waiting in the playlist queue.',
            middleware: [
                'require:text.send_messages',
                'throttle.channel:2,4'
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
        if (!Music.userHasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-role');
        }

        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-connection');
        }

        if (Music.getPlaylist(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.empty-playlist');
        }

        if (!Music.isInSameVoiceChannelAsBot(message, sender)) {
            return app.envoyer.sendWarn(message, 'commands.music.volume-while-not-in-channel').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return message.delete().catch(err => app.logger.error(err));
                }, 10000);
            });
        }

        let playlist = Music.getPlaylist(message);
        let index = playlist.length;

        // Shuffles all but the first index in the playlist
        // array, using the Fisher–Yates shuffle algorithm.
        while (index !== 0) {
            let random = Math.floor(Math.random() * index);
            index -= 1;

            if (index !== 0 && random !== 0) {
                let temporaryValue = playlist[index];

                playlist[index] = playlist[random];
                playlist[random] = temporaryValue;
            }
        }

        Music.playlist[message.guild.id] = playlist;

        return app.envoyer.sendSuccess(message, 'commands.music.shuffle.on-shuffle');
    }
}

module.exports = ShuffleCommand;
