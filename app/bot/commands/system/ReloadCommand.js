/** @ignore */
const path = require('path');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

class ReloadCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('reload', ['rl'], {
            description: 'Reloads the given property.',
            usage: '<property>',
            middleware: [
                'isBotAdmin'
            ]
        });

        this.reloadableProperties = [
            {
                requiredExtraArgs: false,
                triggers: ['lang', 'language'],
                function: this.reloadLanguage
            },
            {
                requiredExtraArgs: true,
                triggers: ['cmd', 'command'],
                function: this.reloadCommand
            },
            {
                requiredExtraArgs: false,
                triggers: ['db', 'database'],
                function: this.reloadDatabase
            },
            {
                requiredExtraArgs: false,
                triggers: ['ser', 'service', 'services'],
                function: this.reloadServices
            },
            {
                requiredExtraArgs: true,
                triggers: ['event', 'evt', 'e'],
                function: this.reloadEventHandler
            }
        ];
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

        if (args[0].toLowerCase() === 'all') {
            let promises = [];
            args = args.shift();

            for (let index in this.reloadableProperties) {
                let property = this.reloadableProperties[index];

                if (property.requiredExtraArgs) {
                    continue;
                }

                promises.push(property.function(message, args));
            }

            return promises;
        }

        let trigger = args[0].toLowerCase();
        args.shift();

        for (let index in this.reloadableProperties) {
            let property = this.reloadableProperties[index];

            if (_.indexOf(property.triggers, trigger) === -1) {
                continue;
            }

            return property.function(message, args);
        }

        return app.envoyer.sendWarn(message, 'Invalid `property` given, there are no reloadable properties called `:property`', {
            property: trigger
        });
    }

    reloadLanguage(message, args) {
        for (let index in require.cache) {
            if (!_.startsWith(index, app.lang.resourcePath)) {
                continue;
            }

            delete require.cache[index];
        }

        let backupLanguageFiles = app.lang.languageFiles;

        try {
            app.lang.loadLanguageFiles();

            return app.envoyer.sendSuccess(message, ':ok_hand: Language files has been reloaded!');
        } catch (err) {
            app.logger.error(err);
            app.lang.languageFiles = backupLanguageFiles;

            return app.envoyer.sendError(message, '**Error:** Failed to reload language files due to a ' + err.name + '\n\n' + err.message);
        }
    }

    reloadCommand(message, args) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, ':warning: Missing argument `command`, a valid command is required.');
        }

        let command = CommandHandler.getCommand(message, args.join(' '));

        if (command === null) {
            return app.envoyer.sendWarn(message, ':warning: Invalid command argument given, `:command` is not a valid command', {
                command: args[0].toLowerCase()
            });
        }

        let commandFile = `./../${command.category}/${command.name}`;
        let commandPath = `${command.category}${path.sep}${command.name}.js`;

        delete app.bot.commands[command.name];
        for (let index in require.cache) {
            if (!_.endsWith(index, commandPath)) {
                continue;
            }

            delete require.cache[index];
        }

        let CommandInstance = require(commandFile);
        let instance = new CommandInstance;
        let commandTriggers = [];
        let commandPrefix = CommandHandler.getGlobalPrefix(command.category);

        _.each(instance.getTriggers(), trigger => commandTriggers.push(_.toLower(trigger)));

        instance.options.prefix = commandPrefix;
        app.bot.commands[command.name] = {
            name: command.name,
            category: command.category,
            prefix: commandPrefix,
            triggers: commandTriggers,
            handler: instance
        };

        return app.envoyer.sendSuccess(message, ':ok_hand: `:command` command has been reloaded!', {
            command: CommandHandler.getPrefix(message, command.category) + commandTriggers[0]
        });
    }

    reloadDatabase(message, args) {
        let databasePath = `app${path.sep}database`;
        for (let index in require.cache) {
            if (index.indexOf(databasePath) === -1) {
                continue;
            }

            delete require.cache[index];
        }

        let Database = require('./../../../database/Database.js');
        app.database = new Database();

        return app.envoyer.sendSuccess(message, ':ok_hand: Database files and connection has been reloaded!');
    }

    reloadServices(message, args) {
        let servicesPath = `app${path.sep}services`;
        for (let index in require.cache) {
            if (index.indexOf(servicesPath) === -1) {
                continue;
            }

            delete require.cache[index];
        }

        app.service = require('./../../../services');
        _.each(app.service, (Service, key) => {
            let ServiceProvider = new Service;

            if (!ServiceProvider.registerService()) {
                //
            }

            app.service[key] = ServiceProvider;
        });

        return app.envoyer.sendSuccess(message, ':ok_hand: Application services has been reloaded!');
    }

    reloadEventHandler(message, args) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, ':warning: Missing argument `event handler`, a valid handler is required.');
        }

        let event = args.join('_').toUpperCase();

        if (!app.bot.handlers.hasOwnProperty(event)) {
            return app.envoyer.sendWarn(message, ':warning: Invalid event handler argument given!');
        }

        let Handler = app.bot.handlers[event];
        let handlerName = Handler.constructor.name;

        let eventPath = `app${path.sep}bot${path.sep}handlers${path.sep}${handlerName}`;

        for (let index in require.cache) {
            if (index.indexOf(eventPath) === -1) {
                continue;
            }

            delete require.cache[index];
        }

        let eventHandler = require(`./../../handlers/${handlerName}`);
        app.bot.handlers[event] = eventHandler;

        return app.envoyer.sendSuccess(message, `:ok_hand: The \`${handlerName}\` event handler has been reloaded!`);
    }
}

module.exports = ReloadCommand;
