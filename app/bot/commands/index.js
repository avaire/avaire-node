/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./Command');
/** @ignore */
const directory = require('require-directory');

var triggers = [];
var commands = {};

_.each(require('./Categories'), function (category) {
    _.each(directory(module, `./${_.toLower(category)}`), function (command, key) {
        if (command.prototype instanceof Command) {
            let instance = new command;
            let commandTriggers = [];
            
            _.each(instance.getTriggers(), function (trigger) {
                if (triggers.indexOf(instance.getPrefix() + trigger) !== -1) {
                    throw new Error([
                        'Command triggers cannot be shared between commands!',
                        `${instance.constructor.name} is attempting to register ${instance.getPrefix()}${trigger}, but the trigger is already registered to another command!`,
                    ].join('\n       '));
                }
                commandTriggers.push(_.toLower(trigger));
            });

            _.each(commandTriggers, function (trigger) {
                triggers.push(instance.getPrefix() + trigger);
            })

            commands[key] = {
                name: key,
                category: _.toLower(category),
                prefix: instance.getPrefix(),
                triggers: commandTriggers,
                handler: instance
            };
        }
    });
});

module.exports = commands;
