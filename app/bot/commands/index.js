/** @ignore */
const directory = require('require-directory');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./Command');
/** @ignore */
const categories = require('./Categories');
/** @ignore */
let triggers = [];

/**
 * The full list of commands.
 *
 * @type {Object}
 */
let commands = {};

_.each(categories, category => {
    _.each(directory(module, `./${_.toLower(category.name)}`), (CommandInstance, key) => {
        if (CommandInstance.prototype instanceof Command) {
            let instance = new CommandInstance;
            let commandTriggers = [];

            instance.options.prefix = category.prefix;

            _.each(instance.getTriggers(), trigger => {
                if (triggers.indexOf(instance.getPrefix() + trigger) !== -1) {
                    throw new Error([
                        'Command triggers cannot be shared between commands!',
                        `${instance.constructor.name} is attempting to register ${instance.getPrefix()}${trigger}, but the trigger is already registered to another command!`
                    ].join('\n       '));
                }
                commandTriggers.push(_.toLower(trigger));
            });

            _.each(commandTriggers, trigger => {
                triggers.push(instance.getPrefix() + trigger);
            });

            commands[key] = {
                name: key,
                category: _.toLower(category.name),
                prefix: instance.getPrefix(),
                triggers: commandTriggers,
                handler: instance
            };
        }
    });
});

module.exports = commands;
