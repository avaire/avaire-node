/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class VolumeCommand extends Command {
    constructor() {
        super('!', 'volume', ['vol'], {
            allowDM: false,
            middleware: [
                'throttle.channel:2,4'
            ],
            description: 'Use this to change the volume of the music that\'s playing.'
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
        if (app.bot.maintenance) {
            return app.envoyer.sendWarn(message, 'Going down for maintenance, you can\'t change the volume right now!');
        }

        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'language.errors.missing-arguments', {
                command: this.getPrefix() + this.getTriggers()[0]
            });
        }

        if (!Music.userHasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-role');
        }

        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-connection');
        }

        if (Music.getPlaylist(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.empty-playlist');
        }

        if (!this.isInSameVoiceChannelAsBot(message, sender)) {
            return app.envoyer.sendWarn(message, 'commands.music.volume-while-not-in-channel').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return message.delete().catch(err => app.logger.error(err));
                }, 10000);
            });
        }

        let volume = Math.max(Math.min(parseInt(args[0], 10), 100), 0);
        Music.setVolume(message, volume);

        let volumeString = '';
        for (let i = 1; i <= 10; i++) {
            volumeString += (i - 1) * 10 < volume ? '▒' : '░';
        }

        return app.envoyer.sendInfo(message, `🎵 Volume set to **${volume}%**\n${volumeString}`).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return message.delete().catch(err => app.logger.error(err));
            }, 6500);
        });
    }

    isInSameVoiceChannelAsBot(message, sender) {
        let voiceChannel = this.getBotVoiceChannel(message);

        if (voiceChannel === null) {
            // Something went really wrong here, we should be connected but the bot wasen't
            // found in any of the voice channels for the guild? What the fuck....
            return false;
        }

        for (let i in voiceChannel.members) {
            if (voiceChannel.members[i].id === sender.id) {
                return true;
            }
        }

        return false;
    }

    getBotVoiceChannel(message) {
        for (let i in message.guild.voiceChannels) {
            let voiceChannel = message.guild.voiceChannels[i];

            for (let x in voiceChannel.members) {
                if (voiceChannel.members[x].id === bot.User.id) {
                    return voiceChannel;
                }
            }
        }

        return null;
    }
}

module.exports = VolumeCommand;
