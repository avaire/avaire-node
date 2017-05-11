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
    }

    /**
     * Gets the command with matching triggers to what the user sent.
     *
     * @param  {IMessage}  message        The Discordie message object that triggered the command.
     * @param  {String}    commandString  The message that was sent by the user.
     * @return {Command|null}
     */
    getCommand(message, commandString) {
        let trigger = commandString.split(' ')[0].toLowerCase();
        let command = this.getGlobalCommand(this.prepareCommandTrigger(message.guild.id, trigger));

        if (command === null) {
            return null;
        }

        // If the guild has a custom prefix for the command category/module and the command was
        // executed with the normal prefix we'll return null as well, preventing the command
        // from being run using normal prefixes while custom prefixes are enabled.
        let normalPrefix = this.getPrefix(message.guild.id, command.category);
        if (normalPrefix !== null && !_.startsWith(trigger, normalPrefix)) {
            return null;
        }

        return command;
    }

    /**
     * Gets the command using global/normal prefixes.
     *
     * @param  {String}  trigger  The commands trigger that should be found.
     * @return {String|null}
     */
    getGlobalCommand(trigger) {
        for (let commandName in app.bot.commands) {
            let command = app.bot.commands[commandName];

            for (let triggerIndex in command.triggers) {
                if (trigger === command.prefix + command.triggers[triggerIndex]) {
                    return command;
                }
            }
        }

        return null;
    }

    /**
     * Gets the prefix for the given module name and guild id.
     *
     * @param  {String}  guildId     The ID of the guild.
     * @param  {String}  moduleName  The name of the module.
     * @return {String|null}
     */
    getPrefix(guildId, moduleName) {
        if (!this.prefixes.hasOwnProperty(guildId)) {
            return null;
        }

        for (let module in this.prefixes[guildId]) {
            if (module.toLowerCase() === moduleName.toLowerCase()) {
                return this.prefixes[guildId][module];
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
     * @return {Command}
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

        for (let i in sortable) {
            let module = sortable[i];

            if (!_.startsWith(command, module[1])) {
                continue;
            }

            return this.getGlobalPrefix(module[0]) + command.substr(module[1].length);
        }

        return command;
    }
}

module.exports = new CommandHandler;
