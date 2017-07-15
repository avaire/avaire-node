/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class VoteSkipCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('voteskip', ['vskip'], {
            allowDM: false,
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

        if (this.isDeafened(message, sender)) {
            return app.envoyer.sendWarn(message, 'commands.music.skip-while-deafened').then(message => {
                return app.scheduler.scheduleDelayedTask(() => {
                    return app.envoyer.delete(message);
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
            let song = Music.getQueue(message).shift();
            if (Music.isRepeat(message)) {
                Music.getQueue(message).push(song);
            }

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
        let members = app.loadProperty(
            Music.getVoiceConnection(message),
            ['voiceConnection', 'channel', 'members']
        );

        if (members === null) {
            return [];
        }
        return members.filter(member => !member.bot);
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

    /**
     * Checks if the user is deafened, if they are they're not listening to
     * the music and thus should not be allowed to vote skip the music.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @param  {IUser}     sender   The user who should used to checked.
     * @return {Boolean}
     */
    isDeafened(message, sender) {
        let guildMember = message.guild.members.find(u => u.id === sender.id);
        if (guildMember === null || guildMember === undefined) {
            return false;
        }
        return guildMember.deaf || guildMember.self_deaf;
    }
}

module.exports = VoteSkipCommand;
