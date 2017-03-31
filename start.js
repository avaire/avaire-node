'use strict';
process.title = 'AvaIre';

let _ = require('lodash');
let Discordie = require('discordie');
let directory = require('require-directory');
let Helpers = require('./app/helpers');
let Database = require('./app/database/Database');

global.app = require('./app');

app.logger.info(`Bootstraping AvaIre v${app.version}`);

app.logger.info(' - Loading configuration');
app.config = app.configLoader.loadConfiguration('config.json');

app.logger.info(' - Setting up database and tables');
app.database = new Database();
app.database.runMigrations().catch(err => {
    app.logger.error(err);
});

app.logger.info(' - Creating bot instance');
global.bot = new Discordie({
    autoReconnect: true
});

app.logger.info(` - Registering ${Object.keys(app.bot.handlers).length + 1} event handlers`);
_.each(app.bot.handlers, (Handler, key) => {
    _.each(Discordie.Events, event => {
        if (key === event) {
            bot.Dispatcher.on(event, new Handler);
        }
    });
});

app.bot.jobs = {};
let jobs = directory(module, './app/bot/jobs');
app.logger.info(` - Registering ${Object.keys(jobs).length - 1} jobs`);
_.each(jobs, (Job, key) => {
    if (key !== 'Job') {
        app.bot.jobs[key] = app.scheduler.registerJob(new Job);
    }
});

app.logger.info(` - Registering ${Object.keys(app.service).length} services`);
_.each(app.service, (Service, key) => {
    let ServiceProvider = new Service;

    if (!ServiceProvider.registerService()) {
        //
    }

    app.service[key] = ServiceProvider;
});

app.logger.info('Connecting to the Discord network...');
bot.connect({token: app.config.bot.token});
