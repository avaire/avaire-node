/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

/** @ignore */
var categories = _.orderBy(require('./../Categories'));

class HelpCommand extends Command {
    constructor() {
        super('.', 'help', ['module', 'modules'], {
            ignoreHelpMenu: true,
            description: [
                'Tells you about what commands the bot has, what they do and how you can use them.'
            ],
            usage: [
                '',
                '[command]',
                '[-category]'
            ]
        });
    }

    onCommand(sender, message, args) {
        if (args.length === 0) {
            return this.showCategories(sender, message);
        }

        if (_.startsWith(args[0], '-')) {
            return this.showCategoryCommands(sender, message, args);
        }

        return this.showCommand(sender, message, args);
    }

    showCategories(sender, message) {
        return app.envoyer.sendEmbededMessage(message, {
            color: 0x3498db,
            title: `:scroll: ${app.lang.get(message, 'commands.general.help.module')}`,
            description: '• ' + categories.join('\n• ') + '\n\n' + app.lang.get(message, 'commands.general.help.category-note')
        }, {
            command: this.getPrefix() + this.getTriggers()[0],
            category: _.toLower(categories[0])
        });
    }

    showCategoryCommands(sender, message, args) {
        let category = args[0].substr(1).toLowerCase();
        let commands = _.filter(app.bot.commands, function (item) {
            return item.category === category && !item.handler.getOptions('ignoreHelpMenu', false);
        });

        if (commands.length === 0) {
            return app.envoyer.sendWarn(message, 'commands.general.help.category-doesnt-exists', {
                category: category
            });
        }

        let fields = [];

        for (let commandIndex in _.sortBy(commands)) {
            let command = commands[commandIndex];
            let field = command.prefix + command.triggers[0];

            for (let i = field.length; i < 28; i++) {
                field += ' ';
            }

            let triggers = [];
            for (let i = 1; i < command.triggers.length; i++) {
                triggers.push(command.prefix + command.triggers[i]);
            }
            field += '[' + triggers + ']';

            fields.push(field);
        }

        let listOfCommands = app.lang.get(message, 'commands.general.help.commands');
        let randomCommandIndex = _.random(0, commands.length - 1);
        message.channel.sendMessage(':page_with_curl: **' + listOfCommands + ':** ```apache\n' + fields.join('\n') + '```');
        return app.envoyer.sendInfo(message, 'commands.general.help.command-note', {
            prefix: commands[randomCommandIndex].prefix,
            trigger: commands[randomCommandIndex].triggers[0]
        });
    }

    showCommand(sender, message, args) {
        let command = CommandHandler.getCommand(args.join(' '));
        if (command === undefined) {
            return app.envoyer.sendWarn(message, 'commands.general.help.command-doesnt-exists', {
                command: args[0]
            });
        }

        let fields = [];

        // Add usage to the fields array
        let usage = '`' + command.prefix + command.triggers[0] + ' ' + command.handler.getUsage() + '`';
        if (_.isObjectLike(command.handler.getUsage())) {
            usage = '`';
            for (let index in command.handler.getUsage()) {
                usage += command.prefix + command.triggers[0] + ' ' + command.handler.getUsage()[index] + '\n';
            }
            usage = usage.substr(0, usage.length - 1) + '`';
        }
        fields.push({name: 'Usage', value: usage});

        // Add aliases to the fields array
        if (command.triggers.length > 1) {
            let aliases = command.triggers.slice(1, command.triggers.length);
            fields.push({name: 'Aliases', value: `\`${command.prefix}` + aliases.join(`\`, \`${command.prefix}`) + '`'});
        }

        let description = command.handler.getDescription();
        if (_.isObjectLike(description)) {
            description = description.join('\n');
        }

        let title = command.triggers[0].toLowerCase();

        return app.envoyer.sendEmbededMessage(message, {
            color: app.envoyer.colors.info,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            description: description,
            fields: fields
        });
    }
}

module.exports = HelpCommand;
