/** @ignore */
const dot = require('dot-object');
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
            description: 'Toggles the Leveling system on and off for the current server',
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
            guild.data.level_alerts = status;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                level_alerts: guild.data.level_alerts
            }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
                return app.envoyer.sendSuccess(message, '`Levels up alerts` has been `:status` for the server.', {
                    status: status ? 'Enabled' : 'Disabled'
                });
            }).catch(err => app.logger.error(err));
        });
    }
}

module.exports = LevelAlertsCommand;
