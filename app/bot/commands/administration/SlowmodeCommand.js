/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/ChannelModule');

/**
 * Slowmode Command, allows server managers to toggle the
 * slowmode module on or off for any given channel.
 *
 * @extends {Command}
 */
class SlowmodeCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('slowmode', [], {
            allowDM: false,
            description: 'Disables the slowmode module or enables it with the given settings, users with the **text.manage_messages** permission are exempt from slowmode limits.',
            usage: [
                '',
                '<limit> <decay in seconds>'
            ],
            middleware: [
                'require.user:general.manage_server',
                'throttle.guild:1,5'
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
        return Module.getChannel(message).then(db => {
            if (args.length === 0) {
                return this.disableSlowmode(message, db);
            }

            return this.enableSlowmode(message, db, args);
        });
    }

    /**
     * Disables the slowmode module.
     *
     * @param  {IMessage}  message   The Discordie message object that triggered the command.
     * @param  {Object}    database  The database channel and guild data object.
     * @return {Promise}
     */
    disableSlowmode(message, database) {
        if (!database.channel.get('slowmode.enabled', false)) {
            return app.envoyer.sendSuccess(message, 'commands.administration.modules.disabled', {
                module: 'Slowmode'
            });
        }

        return Module.toggle(message, 'slowmode', 'Slowmode');
    }

    /**
     * Enables the slowmode module with the given settings, a minimum of
     * two arguments must be parsed to the method for the args array.
     *
     * @param  {IMessage}  message   The Discordie message object that triggered the command.
     * @param  {Object}    database  The database channel and guild data object.
     * @param  {Array}     args      The arguments that was parsed to the command.
     * @return {Promise}
     */
    enableSlowmode(message, database, args) {
        if (args.length < 2) {
            return app.envoyer.sendWarn(message, 'language.errors.missing-arguments', {
                command: this.getPrefix() + this.getTriggers()[0]
            });
        }

        let limit = parseInt(args[0], 10);
        let decay = parseInt(args[1], 10);

        if (isNaN(limit) || isNaN(decay) || limit < 1 || decay < 1) {
            return app.envoyer.sendWarn(message, 'commands.administration.modules.slowmode-require-ints', {
                field: (isNaN(limit) ? 'limit' : 'decay')
            });
        }

        database.channel.data.slowmode.enabled = true;
        return Module.setProperty(message, 'slowmode', ['messagesPerLimit', 'messageLimit'], [limit, decay]).then(() => {
            let enabledMessage = app.lang.get(message, 'commands.administration.modules.enabled', {
                module: 'Slowmode'
            });

            let slowmodeEnabled = app.lang.get(message, 'commands.administration.modules.slowmode-enabled', {
                limit, decay
            });

            return app.envoyer.sendSuccess(message, `${enabledMessage}\n${slowmodeEnabled}`);
        });
    }
}

module.exports = SlowmodeCommand;
