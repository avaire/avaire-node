/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class MoveHereCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('movehere', ['moveh'], {
            allowDM: false,
            description: 'Moves the bot to the same voice channel you\'re in.',
            middleware: [
                'require:text.send_messages',
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
        if (!Music.userHasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-role');
        }

        if (!Music.isConnectedToVoice(message)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-connection');
        }

        if (Music.getQueue(message).length === 0) {
            return app.envoyer.sendWarn(message, 'commands.music.empty-queue');
        }

        if (Music.isInSameVoiceChannelAsBot(message, sender)) {
            return this.sendAndDeleteWarning(message, 'commands.music.sharing-connection');
        }

        let voiceChannel = message.member.getVoiceChannel();
        if (message.member.getVoiceChannel() === null) {
            return this.sendAndDeleteWarning(message, 'commands.music.voice-required');
        }

        if (!this.hasGivenPermissions(message, ['Connect', 'Speak'])) {
            return;
        }

        return voiceChannel.join().then(() => {
            return app.envoyer.sendInfo(message, 'commands.music.move-now-streaming', {
                channel: voiceChannel.name
            });
        });
    }

    /**
     * Checks if the bot has the give voice permissions, if the bot doesn't
     * have any of the permissions, a warning message will be sent to
     * the user and the method will return false.
     *
     * @param  {IMessage}  message      The Discordie message object that triggered the command.
     * @param  {Array}     permissions  The array of permissions to check.
     * @return {Boolean}
     */
    hasGivenPermissions(message, permissions) {
        for (let i in permissions) {
            let permission = permissions[i];

            if (!app.permission.has(bot.User, message.member.getVoiceChannel(), 'voice.' + permission.toLowerCase())) {
                app.envoyer.sendWarn(message, 'commands.music.missing-permissions', {
                    permission
                });
                return false;
            }
        }
        return true;
    }

    /**
     * Sends a warning message and deletes it again after the given delay.
     *
     * @param  {IMessage}  message        The Discordie message object that triggered the command.
     * @param  {String}    stringMessage  The message that should be sent.
     * @param  {Object}    placeholders   The placeholders for the message.
     * @param  {Number}    delay          The delay before the message should be deleted.
     * @return {Promise}
     */
    sendAndDeleteWarning(message, stringMessage, placeholders = {}, delay = 10000) {
        return app.envoyer.sendWarn(message, stringMessage, placeholders).then(message => {
            return app.scheduler.scheduleDelayedTask(() => {
                return message.delete().catch(err => app.logger.error(err));
            }, delay);
        });
    }
}

module.exports = MoveHereCommand;
