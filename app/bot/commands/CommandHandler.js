/** @ignore */
const _ = require('lodash');
/** @ignore */
const categories = require('./Categories');

/**
 * Command handler, allows for easy access
 * to any command in the registry.
 */
class CommandHandler {

    /**
     * Prepares the command handler for use.
     */
    constructor() {
        /**
         * The guild command prefixes backup cache.
         *
         * @type {Object}
         */
        this.prefixes = {};

        /**
         * The guild command aliases backup cache.
         *
         * @type {Object}
         */
        this.aliases = {};
    }

    /**
     * Gets the command with matching triggers to what the user sent.
     *
     * @param  {IMessage}  message        The Discordie message object that triggered the command.
     * @param  {String}    commandString  The message that was sent by the user.
     * @param  {Boolean}   useAliases     Determines if aliases should be checked as commands too.
     * @return {Object<Command, Boolean>|null}
     */
    getCommand(message, commandString, useAliases = true) {
        let trigger = commandString.split(' ')[0].toLowerCase();

        if (message.isPrivate) {
            return this.getGlobalCommand(trigger);
        }

        let commands = this.prepareCommandTrigger(message.guild.id, trigger);
        for (let i in commands) {
            let command = this.getGlobalCommand(commands[i]);

            if (command === null) {
                continue;
            }

            // If the guild has a custom prefix for the command category/module and the command was
            // executed with the normal prefix we'll return null as well, preventing the command
            // from being run using normal prefixes while custom prefixes are enabled.
            let normalPrefix = this.getPrefix(message, command.command.category);
            if (normalPrefix !== null && !_.startsWith(trigger, normalPrefix)) {
                return null;
            }

            return command;
        }

        if (!useAliases) {
            return null;
        }
        return this.getCommandByAlias(message, commandString);
    }

    /**
     * Gets the command using global/normal prefixes.
     *
     * @param  {String}  trigger  The commands trigger that should be found.
     * @return {Object}
     */
    getGlobalCommand(trigger) {
        trigger = trigger.trim().split(' ')[0].toLowerCase();

        for (let commandName in app.bot.commands) {
            let command = app.bot.commands[commandName];

            for (let triggerIndex in command.triggers) {
                if (trigger === command.prefix + command.triggers[triggerIndex]) {
                    return {command, useAlias: false};
                }
            }
        }

        return null;
    }

    /**
     * Gets the command with matching aliase triggers to what the user sent.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    alias    The command alias that should be checked.
     * @return {Object<Command, Boolean>|null}
     */
    getCommandByAlias(message, alias) {
        alias = alias.toLowerCase();

        let guildId = message.guild.id;
        let memoryGuildCache = app.cache.get(`database.${guildId}`, null, 'memory');

        if (memoryGuildCache !== null) {
            this.aliases[guildId] = memoryGuildCache.get('aliases', {});
        }

        if (this.aliases[guildId].length === 0) {
            return null;
        }

        let sortable = [];
        for (let token in this.aliases[guildId]) {
            sortable.push([token, this.aliases[guildId][token]]);
        }
        sortable.sort((a, b) => b[0].length - a[0].length);

        for (let i in sortable) {
            let token = sortable[i];

            if (!_.startsWith(alias, token[0])) {
                continue;
            }

            let command = this.getGlobalCommand(token[1]);
            command.useAlias = true;
            command.args = _.drop(token[1].split(' '));

            return command;
        }
        return null;
    }

    /**
     * Gets the prefix for the given module name and guild id.
     *
     * @param  {IMessage}  message     The Discordie message object that triggered the command.
     * @param  {String}    moduleName  The name of the module.
     * @return {String|null}
     */
    getPrefix(message, moduleName) {
        if (message.isPrivate) {
            return this.getGlobalPrefix(moduleName);
        }

        if (!this.prefixes.hasOwnProperty(message.guild.id)) {
            return null;
        }

        for (let module in this.prefixes[message.guild.id]) {
            if (module.toLowerCase() === moduleName.toLowerCase()) {
                return this.prefixes[message.guild.id][module];
            }
        }

        return this.getGlobalPrefix(moduleName);
    }

    /**
     * Gets the global command prefix for the given module name.
     *
     * @param {String}  module  The name of the module.
     * @return {String|null}
     */
    getGlobalPrefix(module) {
        for (let i in categories) {
            let category = categories[i];

            if (category.name.toLowerCase() === module.toLowerCase()) {
                return category.prefix;
            }
        }

        return null;
    }

    /**
     * Prepares the command trigger, replacing the current prefix with
     * the custom guild prefix for the command module if one is set.
     *
     * @param  {String}  guildId  The ID of the guild.
     * @param  {String}  command  The command trigger.
     * @return {Array}
     */
    prepareCommandTrigger(guildId, command) {
        let memoryGuildCache = app.cache.get(`database.${guildId}`, null, 'memory');
        if (memoryGuildCache !== null) {
            this.prefixes[guildId] = memoryGuildCache.get('prefixes', {});
        }

        if (this.prefixes[guildId].length === 0) {
            return command;
        }

        let sortable = [];
        for (let module in this.prefixes[guildId]) {
            sortable.push([module, this.prefixes[guildId][module]]);
        }
        sortable.sort((a, b) => b[1].length - a[1].length);

        let sharedCommands = [];
        for (let i in sortable) {
            let module = sortable[i];

            if (!_.startsWith(command, module[1])) {
                continue;
            }

            sharedCommands.push(this.getGlobalPrefix(module[0]) + command.substr(module[1].length));
        }

        if (sharedCommands.length === 0) {
            sharedCommands.push(command);
        }

        return sharedCommands;
    }
}

module.exports = new CommandHandler;
