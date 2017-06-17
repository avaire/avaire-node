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
class LevelCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('level', ['lvl'], {
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
            let status = !guild.get('levels', 0);

            guild.data.levels = status ? 1 : 0;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                levels: guild.data.levels
            }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
                let note = '';
                if (status) {
                    let alertStatus = guild.get('level_alerts', 0) ? 'Enabled' : 'Disabled';
                    note = `\nLevel alerts are current \`${alertStatus}\`, you can toggel them on or off with \`.levelalerts\``;
                }

                return app.envoyer.sendSuccess(message, '`Levels & Experience` has been `:status` for the server.:note', {
                    status: status ? 'Enabled' : 'Disabled', note
                });
            }).catch(err => app.logger.error(err));
        });
    }
}

module.exports = LevelCommand;
