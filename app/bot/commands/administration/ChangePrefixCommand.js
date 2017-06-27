/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

/** @ignore */
let categories = _.orderBy(require('./../Categories'));

/**
 * Change Prefix Command, allows server admins to change or
 * set any prefix for all the command modules/categories.
 *
 * @extends {Command}
 */
class ChangePrefixCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('changeprefix', ['avaireprefix'], {
            usage: '<module> [prefix]',
            middleware: [
                'require.user:general.administrator',
                'throttle.guild:1,5'
            ]
        });

        /**
         * The list of valid category names the
         * user can change the prefix for.
         *
         * @type {Array}
         */
        this.categoryNames = _.map(categories, category => category.name.toLowerCase());
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        let module = this.getModule(args[0]);
        if (module === null) {
            return app.envoyer.sendWarn(message, 'commands.administration.changeprefix.invalid', {
                module: args[0]
            });
        }

        if (args.length === 1) {
            return this.removeCustomPrefix(message, module);
        }

        let prefix = args[1];
        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let prefixes = guild.get('prefixes', {});

            prefixes[module] = prefix;
            guild.data.prefixes = prefixes;

            app.database.update(app.constants.GUILD_TABLE_NAME, {
                prefixes: JSON.stringify(guild.data.prefixes)
            }, query => query.where('id', app.getGuildIdFrom(message)));

            return app.envoyer.sendSuccess(message, 'commands.administration.changeprefix.updated', {
                prefix, module
            });
        });
    }

    /**
     * Removes the custom prefix for the given module.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    module   The name of the module that should be reset back to the default prefix.
     * @return {Promise}
     */
    removeCustomPrefix(message, module) {
        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let prefixes = guild.get('prefixes', {});
            let prefix = CommandHandler.getGlobalPrefix(module);

            if (!prefixes.hasOwnProperty(module)) {
                return app.envoyer.sendSuccess(message, 'commands.administration.changeprefix.reset', {
                    prefix, module
                });
            }

            delete prefixes[module];
            guild.data.prefixes = prefixes;

            app.database.update(app.constants.GUILD_TABLE_NAME, {
                prefixes: JSON.stringify(guild.data.prefixes)
            }, query => query.where('id', app.getGuildIdFrom(message)));

            return app.envoyer.sendSuccess(message, 'commands.administration.changeprefix.reset', {
                prefix, module
            });
        });
    }

    /**
     * Gets the full module name that matches the given module.
     *
     * @param  {String}  module  The module that should be fetched.
     * @return {String|null}
     */
    getModule(module) {
        for (let i in this.categoryNames) {
            if (_.startsWith(this.categoryNames[i], module.toLowerCase())) {
                return this.categoryNames[i];
            }
        }
        return null;
    }
}

module.exports = ChangePrefixCommand;
