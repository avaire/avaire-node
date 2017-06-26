/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

/**
 * Language Command, allows server managers to set the
 * language the bot uses in the current guild.
 *
 * @extends {Command}
 */
class LevelAlertsCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('levelalerts', ['lvlalert'], {
            allowDM: false,
            middleware: [
                'require.user:general.manage_server',
                'throttle.user:1,5'
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
        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            if (guild.get('levels', 0) === 0) {
                return app.envoyer.sendWarn(message, 'The `Levels & Experience` feature is not enabled for this server, enabled it first with `.level`');
            }

            let status = !guild.get('level_alerts', 0);

            let channelId = null;
            if (args.length > 0) {
                channelId = this.getChannelId(message, args[0]);

                if (channelId !== null) {
                    status = 1;
                }
            }

            guild.data.level_alerts = status;
            guild.data.level_channel = channelId;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                level_alerts: guild.data.level_alerts,
                level_channel: channelId
            }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
                return app.envoyer.sendSuccess(message, '`Levels up alerts` has been `:status` for the server.:note', {
                    status: status ? 'Enabled' : 'Disabled',
                    note: channelId === null ? `` : `\nAll level up messages will be logged into the <#${channelId}> channel.`
                });
            }).catch(err => app.logger.error(err));
        });
    }

    /**
     * Gets the channel ID from the given message.
     *
     * @param  {IMessage} message        The Discordie message object that triggered the command.
     * @param  {String}   channelString  The channel argument given to the command.
     * @return {String|null}
     */
    getChannelId(message, channelString) {
        if (!_.startsWith(channelString, '<#')) {
            return channelString.toLowerCase() === 'all' ? 'all' : null;
        }

        let id = channelString.substr(2, channelString.length - 3);
        let channels = message.guild.channels;
        for (let i in channels) {
            let channel = channels[i];
            if (channel.type === 0 && channel.id === id) {
                return id;
            }
        }
        return null;
    }
}

module.exports = LevelAlertsCommand;
