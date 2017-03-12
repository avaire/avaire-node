/** @ignore */
const _ = require('lodash');

class Command {
    constructor(prefix, command, aliases, options) {
        if (typeof prefix === 'undefined') {
            throw new Error('The prefix parameter can not be undefined!');
        }

        if (typeof command === 'undefined') {
            throw new Error('The command parameter can not be undefined!');
        }

        if (typeof options === 'undefined') {
            options = {};
        }

        this.options = options;
        this.options.prefix = prefix;
        this.options.command = command;
        let triggers = [command];

        if (typeof aliases !== 'undefined') {
            _.each(aliases, function (trigger) {
                triggers.push(trigger);
            });
        }
        this.options.triggers = triggers;
    }

    getPrefix() {
        return this.getOptions('prefix');
    }

    getTriggers() {
        return this.getOptions('triggers', []);
    }

    getOptions(property, fallback) {
        if (typeof property === 'undefined') {
            return this.options;
        }

        let items = property.split('.');
        let option = this.options;
        for (let index in items) {
            let item = items[index];

            if (!option.hasOwnProperty(item)) {
                return fallback;
            }

            option = option[item];
        }

        return option;
    }

    getDescription() {
        return this.getOptions('description', 'This command doesn\'t have a description yet...');
    }

    getUsage() {
        return this.getOptions('usage', '');
    }

    onCommand(sender, message, args) {
        return message.reply('This command has not yet implemented command handling functionality!');
    }
}

module.exports = Command;
