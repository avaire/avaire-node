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
        super('!', 'voteskip', ['vskip'], {
            allowDM: false,
            description: 'Use this to vote to skip a song if you\'re not enjoing it.',
            middleware: [
                'throttle.user:2,5'
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

        if (Music.getPlaylist(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.empty-playlist');
        }

        if (!Music.isInSameVoiceChannelAsBot(message, sender)) {
            return app.envoyer.sendWarn(message, 'commands.music.skip-while-not-in-channel').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return message.delete().catch(err => app.logger.error(err));
                }, 10000);
            });
        }

        let hadUserBefore = true;

        let voteSkips = Music.getVoteSkips(message);
        if (voteSkips.indexOf(sender.id) <= -1) {
            voteSkips.push(sender.id);
            hadUserBefore = false;
        }

        let usersInVoiceLength = this.getUsersInVoice(message).length;
        let votePercentage = this.getVotePercentage(usersInVoiceLength, voteSkips);

        if (votePercentage >= 50) {
            Music.getPlaylist(message).shift();
            return Music.next(message);
        }

        let neededVotes = this.getNeededVotes(usersInVoiceLength, voteSkips);

        let placeholders = {
            needed: neededVotes,
            votes: voteSkips.length,
            total: neededVotes - voteSkips.length
        };

        if (hadUserBefore) {
            return app.envoyer.sendInfo(message, 'commands.music.voteskip.has-voted', placeholders);
        }

        return app.envoyer.sendInfo(message, 'commands.music.voteskip.just-voted', placeholders);
    }

    /**
     * Gets the non-bot users in the voice channel.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Array}
     */
    getUsersInVoice(message) {
        return Music.getVoiceConnection(message)
                    .voiceConnection.channel.members
                    .filter(member => !member.bot);
    }

    /**
     * Gets the vote percentage.
     *
     * @param  {Number}  usersInVoiceLength  The amount of users in the voice channel.
     * @param  {Array}   voteSkips           The people who have already voted.
     * @return {Number}
     */
    getVotePercentage(usersInVoiceLength, voteSkips) {
        let numeric = (voteSkips.length / usersInVoiceLength) * 100;

        return Math.ceil(numeric);
    }

    /**
     * Gets the amount of votes needed to successfully skip the song.
     *
     * @param  {Number}  usersInVoiceLength  The amount of users in the voice channel.
     * @param  {Array}   voteSkips           The people who have already voted.
     * @return {Number}
     */
    getNeededVotes(usersInVoiceLength, voteSkips) {
        for (let i = 1; i < (usersInVoiceLength + 1); i++) {
            if (this.getVotePercentage(usersInVoiceLength, voteSkips.length + i) >= 50) {
                return i;
            }
        }

        return Math.ceil(usersInVoiceLength / 2);
    }
}

module.exports = SkipCommand;
