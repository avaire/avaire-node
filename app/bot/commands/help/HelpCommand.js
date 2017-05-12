/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

/** @ignore */
let categories = _.orderBy(require('./../Categories'));

class HelpCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('help', ['module', 'modules'], {
            ignoreHelpMenu: true,
            description: [
                'Tells you about what commands the bot has, what they do and how you can use them.'
            ],
            usage: [
                '',
                '[command]',
                '[category]'
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
            return this.showCategories(sender, message);
        }

        if (!this.looksLikeCommand(message, args[0])) {
            return this.showCategoryCommands(sender, message, args);
        }

        return this.showCommand(sender, message, args);
    }

    showCategories(sender, message) {
        let filteredCategories = _.map(categories.filter(category => {
            for (let commandName in app.bot.commands) {
                let command = app.bot.commands[commandName];

                if (command.category === category.name.toLowerCase() &&
                       !command.handler.getOptions('ignoreHelpMenu', false)) {
                    return true;
                }
            }
            return false;
        }), 'name');

        let prefix = CommandHandler.getPrefix(message,
            app.bot.commands[this.constructor.name].category
        );

        return app.envoyer.sendEmbededMessage(message, {
            color: 0x3498DB,
            title: `:scroll: ${app.lang.get(message, 'commands.utility.help.module')}`,
            description: '• ' + filteredCategories.join('\n• ') + '\n\n' + app.lang.get(message, 'commands.utility.help.category-note')
        }, {
            command: prefix + this.getTriggers()[0],
            category: _.toLower(filteredCategories[0])
        });
    }

    showCategoryCommands(sender, message, args) {
        let category = args[0].toLowerCase();

        if (category.charAt(0).match(/[a-z]/g) === null) {
            category = category.substr(1);
        }

        let commands = _.filter(app.bot.commands, item => {
            if (item.handler.getOptions('ignoreHelpMenu', false)) {
                return false;
            }

            return item.category === category || _.startsWith(item.category, category);
        });

        if (commands.length === 0) {
            return app.envoyer.sendWarn(message, 'commands.utility.help.category-doesnt-exists', {
                category
            });
        }

        let fields = [];

        let prefix = CommandHandler.getPrefix(message, commands[0].category);

        commands = _.sortBy(commands, [command => command.triggers[0]]);
        for (let commandIndex in commands) {
            let command = commands[commandIndex];
            let field = prefix + command.triggers[0];

            for (let i = field.length; i < 28; i++) {
                field += ' ';
            }

            let triggers = [];
            for (let i = 1; i < command.triggers.length; i++) {
                triggers.push(prefix + command.triggers[i]);
            }
            field += '[' + triggers + ']';

            fields.push(field);
        }

        let listOfCommands = app.lang.get(message, 'commands.utility.help.commands');
        let randomCommandIndex = _.random(0, commands.length - 1);

        app.envoyer.sendNormalMessage(message, ':page_with_curl: **' + listOfCommands + ':** ```apache\n' + fields.join('\n') + '```');
        return app.envoyer.sendInfo(message, 'commands.utility.help.command-note', {
            trigger: commands[randomCommandIndex].triggers[0], prefix
        });
    }

    showCommand(sender, message, args) {
        let command = CommandHandler.getCommand(message, args.join(' '));
        if (command === null) {
            return app.envoyer.sendWarn(message, 'commands.utility.help.command-doesnt-exists', {
                command: args[0]
            });
        }

        let fields = [];

        let prefix = CommandHandler.getPrefix(message, command.category);

        // Add usage to the fields array
        let usage = '`' + prefix + command.triggers[0] + ' ' + command.handler.getUsage() + '`';
        if (_.isObjectLike(command.handler.getUsage())) {
            usage = '`';
            for (let index in command.handler.getUsage()) {
                usage += prefix + command.triggers[0] + ' ' + command.handler.getUsage()[index] + '\n';
            }
            usage = usage.substr(0, usage.length - 1) + '`';
        }
        fields.push({name: 'Usage', value: usage});

        // Add aliases to the fields array
        if (command.triggers.length > 1) {
            let aliases = command.triggers.slice(1, command.triggers.length);
            fields.push({name: 'Aliases', value: `\`${prefix}` + aliases.join(`\`, \`${prefix}`) + '`'});
        }

        let description = command.handler.getDescription();
        if (_.isObjectLike(description)) {
            description = description.join('\n');
        }

        if (command.handler.getOptions('middleware', []).indexOf('isBotAdmin') > -1) {
            description += '\n**Bot Administrators Only**';
        }

        let title = command.triggers[0].toLowerCase();

        return app.envoyer.sendEmbededMessage(message, {
            color: app.envoyer.colors.info,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            description,
            fields
        });
    }

    looksLikeCommand(message, string) {
        for (let i in categories) {
            let category = categories[i];

            if (_.startsWith(string, this.getPrefixFromModule(message, category.name))) {
                return true;
            }
        }

        return false;
    }

    getPrefixFromModule(message, module) {
        if (message.isPrivate) {
            return CommandHandler.getGlobalPrefix(module);
        }
        return CommandHandler.getPrefix(message, module);
    }
}

module.exports = HelpCommand;
