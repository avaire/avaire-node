'use strict';
process.title = 'AvaIre';

var Discordie = require('discordie');

global.app = require('./app');

app.logger.info(`Bootstraping AvaIre v${app.version}`);

app.logger.info(' - Loading configuration');
app.config = app.configLoader.loadConfiguration('config.json');

app.logger.info(' - Creating bot instance');
global.bot = new Discordie({
    autoReconnect: true
});

bot.Dispatcher.on(Discordie.Events.GATEWAY_READY, function (socket) {
    bot.Users.fetchMembers();
    app.logger.info(
        `Logged in as ${bot.User.username}#${bot.User.discriminator} (ID: ${bot.User.id})`
      + ` and serving ${bot.Users.length} users in ${bot.Guilds.length} servers.`
    );
});

bot.Dispatcher.on(Discordie.Events.DISCONNECTED, function (socket) {
    app.logger.error('Disonnected from the Discord gateway: ' + socket.error);

    if (socket.autoReconnect) {
        app.logger.error('Attemping to reconnect in ' + Math.ceil(socket.delay) + ' ms');
    }
});

bot.Dispatcher.on(Discordie.Events.GATEWAY_RESUMED, function (socket) {
    app.logger.info('Discord gateway connection has been resumed!');
});

bot.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, function (socket) {
    app.logger.info(`${socket.message.author.username} said: ${socket.message.content}`);
});

app.logger.info('Connecting to the Discord network...');
bot.connect({ token: app.config.bot.token });
