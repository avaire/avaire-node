/** @ignore */
const utils = require('util');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const directory = require('require-directory');
/** @ignore */
const Discordie = require('discordie');
/** @ignore */
const Raven = require('raven');
/** @ignore */
const Helpers = require('./app/helpers');
/** @ignore */
const ShardManager = require('./app/shards/ShardManager');

class Application {

    /**
     * Bootstraps the application and prepares it for use.
     *
     * @return {Promise}
     */
    bootstrap() {
        global.app = require('./app');
        app.bot.jobs = {};
        app.raven = null;

        app.logger.info(`Bootstraping AvaIre v${app.version}`);

        this.prepareConfig();
        this.prepareDiscordie();

        return this.prepareDatabase();
    }

    /**
     * Bootstraps the application and prepares it for testing.
     */
    bootstrapTests() {
        global.app = require('./app');
        app.bot.jobs = {};
        app.raven = null;

        this.prepareConfig(false);
        app.config.environment = 'testing';
        app.config.database = {
            type: 'sqlite3',
            filename: ':memory:'
        };

        this.prepareDiscordie();

        return this.prepareDatabase();
    }

    /**
     * Registers and prepares the events, jobs and services that Ava uses.
     */
    register() {
        app.logger.info('Registering events, jobs & services');

        app.shard = new ShardManager();

        this.registerRaven();
        this.registerEvents();
        this.registerJobs();
        this.registerServices();
        this.registerPrefixes();
    }

    /**
     * Registers and prepares the events, and services that Ava uses.
     */
    registerEventsServicesAndPrefixes() {
        app.shard = new ShardManager();

        this.registerEvents();
        this.registerServices();
        this.registerPrefixes();
    }

    /**
     * Connects the bot to the Discord network.
     */
    connect() {
        app.logger.info('Connecting to the Discord network...');
        bot.connect({token: app.config.bot.token});
    }

    /**
     * Loads the config from file and stores it in the global app variable.
     *
     * @param {Boolean}  sendMessage  Determines if the log message should be sent.
     */
    prepareConfig(sendMessage = true) {
        if (sendMessage) {
            app.logger.info(' - Loading configuration');
        }
        app.config = app.configLoader.loadConfiguration('config.json', err => {
            app.logger.error('Failed to load the config.json file, make sure the file exists in the root of the project!');
            throw err;
        });

        if (!app.config.bot.hasOwnProperty('activationDelay')) {
            app.config.bot.activationDelay = 0;
        }
    }

    /**
     * Loads and prepares the database by storing it in the global app variable,
     * connecting to the database, and running any migrations needs to be run.
     *
     * @return {Promise}
     */
    prepareDatabase() {
        app.logger.info(' - Setting up database and tables');

        const Database = require('./app/database/Database');

        app.database = new Database();
        return app.database.runMigrations();
    }

    /**
     * Prepares the bot instance and stores it in the global bot variable.
     */
    prepareDiscordie() {
        app.logger.info(' - Creating bot instance');

        let options = this.buildDiscordOptions();

        options.autoReconnect = true;
        global.bot = new Discordie(options);
    }

    /**
     * Register raven, if a raven api token has been given the raven package will be
     * configured and installed, allowing Ava to log errors to a web interface
     * where it's easier for developers to figure out what went wrong.
     */
    registerRaven() {
        if (!app.config.apiKeys.hasOwnProperty('raven') || app.config.apiKeys.raven.trim().length === 0) {
            return;
        }

        Raven.config(app.config.apiKeys.raven).install();
        app.raven = Raven;
    }

    /**
     * Registers the Discordie and process events.
     */
    registerEvents() {
        app.logger.info(` - Registering ${Object.keys(app.bot.handlers).length + 1} event handlers`);
        bot.Dispatcher.onAny((type, socket) => {
            if (app.bot.handlers.hasOwnProperty(type)) {
                return app.bot.handlers[type].handle(socket);
            }
        });

        process.on('unhandledRejection', (reason, p) => {
            if (isEnvironmentInProduction()) {
                return app.logger.debug(`Unhandled promise: ${utils.inspect(p, {depth: 3})}: ${reason}`);
            }
            return app.logger.info(`Unhandled promise: ${utils.inspect(p, {depth: 3})}: ${reason}`);
        });
    }

    /**
     * Registers the jobs.
     */
    registerJobs() {
        app.shard.registerJobs();

        _.each(directory(module, './app/bot/jobs'), (Job, key) => {
            if (key !== 'Job') {
                app.bot.jobs[key] = app.scheduler.registerJob(new Job);
            }
        });
        app.logger.info(` - Registering ${Object.keys(app.bot.jobs).length - 1} jobs`);
    }

    /**
     * Registers the application services.
     */
    registerServices() {
        app.logger.info(` - Registering ${Object.keys(app.service).length} services`);
        _.each(app.service, (Service, key) => {
            let ServiceProvider = new Service;

            if (!ServiceProvider.registerService()) {
                //
            }

            app.service[key] = ServiceProvider;
        });
    }

    /**
     * Registeres all of the different command prefixes that are used throughout the application.
     */
    registerPrefixes() {
        let prefixes = [];

        _.each(app.bot.commands, command => {
            if (prefixes.indexOf(command.prefix) === -1) {
                prefixes.push(command.prefix);
            }
        });

        app.bot.commandPrefixes = prefixes;
    }

    /**
     * Builds the Discordie options object based off the
     * provided arguments parsed to the start.js file.
     */
    buildDiscordOptions() {
        let options = {};
        let parsers = [
            {
                trigger: ['--shard-id', '--shardid', '-sid'],
                value: 'shardId'
            },
            {
                trigger: ['--shard-count', '--shardcount', '-scount', '-sc'],
                value: 'shardCount'
            },
            {
                trigger: ['--message-cache-limit', '--message-limit', '-mcl'],
                value: 'messageCacheLimit'
            }
        ];

        for (let i in process.argv) {
            let opt = process.argv[i].toLowerCase();

            if (opt.indexOf('=') < 0) {
                continue;
            }

            let parserValue = null;
            let parts = opt.split('=');
            for (let x in parsers) {
                if (parserValue !== null) {
                    continue;
                }

                let parser = parsers[x];
                if (parser.trigger.indexOf(parts[0]) < 0) {
                    continue;
                }

                parserValue = parser.value;
            }

            if (parserValue === null) {
                continue;
            }

            options[parserValue] = parseInt(parts[1], 10);
        }

        return options;
    }
}

module.exports = new Application;
