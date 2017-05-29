/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

/**
 * Alias command, used to create custom
 * aliases for pre-existig commands.
 *
 * @extends {Command}
 */
class AliasCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('alias', ['cmdmap'], {
            allowDM: false,
            description: 'Creates and maps a custom aliase for a pre-existing command. Provide no alias to remove an existing alias.',
            usage: '<command alias> [command]',
            middleware: [
                'throttle.user:2,5',
                'require.user:general.manage_server'
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let aliases = guild.get('aliases', {});

            if (args.length === 1) {
                return this.removeCustomAlias(message, guild, aliases, args[0].toLowerCase());
            }

            if (this.getOrderedAlias(aliases, args[0].toLowerCase()) !== null) {
                return app.envoyer.sendWarn(message, 'There is already a custom alias called `:alias`', {
                    alias: args[0]
                });
            }

            let guildType = guild.getType();
            if (aliases.length >= guildType.get('limits.aliases')) {
                return app.envoyer.sendWarn(message, 'The server doesn\'t have any more aliases slots.');
            }

            let commandString = _.drop(args).join(' ');
            let command = CommandHandler.getCommand(message, commandString, false);
            if (command === null) {
                return app.envoyer.sendWarn(message, 'Invalid command given, I don\'t know of any command called `:command`', {
                    command: args[1]
                });
            }

            aliases[args[0].toLowerCase()] = this.buildAliasCommandString(command.command, commandString);
            guild.data.aliases = aliases;

            app.database.update(app.constants.GUILD_TABLE_NAME, {
                aliases: JSON.stringify(guild.data.aliases)
            }, query => query.where('id', app.getGuildIdFrom(message)))
                .catch(err => app.logger.error(err));

            return app.envoyer.sendSuccess(message, 'The `:alias` allias has been linked to `:command`\nThe server has `:slots` more aliases slots available.', {
                alias: args[0],
                command: _.drop(args).join(' '),
                slots: guildType.get('limits.aliases') - Object.keys(aliases).length
            });
        });
    }

    /**
     * Removes a pre-existing custom alias.
     *
     * @param  {IMessage}          message  The Discordie message object that triggered the command.
     * @param  {GuildTransformer}  guild    The database guild transformer for the current guild.
     * @param  {Object}            aliases  The list/object of aliases that already exists.
     * @param  {String}            alias    The alias that should be removed.
     * @return {Promise}
     */
    removeCustomAlias(message, guild, aliases, alias) {
        let customAlias = this.getOrderedAlias(aliases, alias);

        if (customAlias === null) {
            return app.envoyer.sendSuccess(message, 'Invalid alias given, there are no aliases matching `:alias`.', {
                alias
            });
        }

        delete aliases[customAlias];
        guild.data.aliases = aliases;

        app.database.update(app.constants.GUILD_TABLE_NAME, {
            aliases: JSON.stringify(guild.data.aliases)
        }, query => query.where('id', app.getGuildIdFrom(message)));

        return app.envoyer.sendSuccess(message, 'The `:alias` alias has been deleted successfully.', {
            alias
        });
    }

    /**
     * Builds the command alias string.
     *
     * @param  {Object}  command        The command the command alias string should be built for.
     * @param  {String}  commandString  The command string that should be converted to the command alias string.
     * @return {String}
     */
    buildAliasCommandString(command, commandString) {
        return command.prefix + command.triggers[0] + ' ' +
               _.drop(commandString.split(' ')).join(' ');
    }

    /**
     * Orders the aliases and gets the alias
     * that matches the given string.
     *
     * @param  {Object}  aliases  The list/object of aliases that already exists.
     * @param  {String}  string   The alias string that should be returned.
     * @return {String|null}
     */
    getOrderedAlias(aliases, string) {
        let sortable = [];
        for (let token in aliases) {
            sortable.push([token, aliases[token]]);
        }
        sortable.sort((a, b) => b[0].length - a[0].length);

        for (let i in sortable) {
            let token = sortable[i];

            if (!_.startsWith(string, token[0])) {
                continue;
            }

            return token[0];
        }
        return null;
    }
}

module.exports = AliasCommand;
