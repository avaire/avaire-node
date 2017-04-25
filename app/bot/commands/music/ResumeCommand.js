/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class ResumeCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('!', 'resume', [], {
            allowDM: false,
            description: 'Pauses the song that is currently playing.',
            middleware: [
                'require:text.send_messages',
                'throttle.channel:2,5'
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
            return app.envoyer.sendWarn(message, 'commands.music.pauseresume.resume-on-empty');
        }

        if (this.isAloneInVoiceChannel(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.pauseresume.resume-while-alone');
        }

        Music.unpauseStream(message);
        return app.envoyer.sendSuccess(message, 'commands.music.pauseresume.resumed');
    }

    /**
     * Checks to see if the bot is alone in the voice channel.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Boolean}
     */
    isAloneInVoiceChannel(message) {
        for (let i in message.guild.voiceChannels) {
            let voiceChannel = message.guild.voiceChannels[i];

            for (let x in voiceChannel.members) {
                if (voiceChannel.members[x].id === bot.User.id) {
                    return voiceChannel.members.length <= 1;
                }
            }
        }

        return false;
    }
}

module.exports = ResumeCommand;
