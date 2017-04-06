/** @ignore */
const _ = require('lodash');
/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const CommandHandler = require('./../commands/CommandHandler');
/** @ignore */
const ProcessCommand = require('./../middleware/ProcessCommand');

/**
 * Emitted when a user sends a text message in any valid text channel in a guild.
 *
 * @extends {EventHandler}
 */
class MessageCreateEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        // Checks if the message was sent from the bot itself, or another bot, if that's
        // the case we want to simply just end the event there, otherwise we'll end up
        // with an endless loop of messages going on and on and on and on and...
        if (bot.User.id === socket.message.author.id || socket.message.author.bot) {
            return;
        }

        // If the message was sent from one of the official discord servers(Discord API, Discord Developers etc...)
        // and the user who sent the message isn't a bot administrator we'll kill the event to prevent spamming
        // chat when other users might use a command that matches a command from another bot.
        if (!MessageCreateEvent.prototype.shouldContinue(socket)) {
            return;
        }

        let message = socket.message.content;
        let command = CommandHandler.getCommand(message);

        // Checks to see if a valid command was found from the message context, if a
        // command was found the onCommand method will be called for the handler.
        if (command !== null) {
            return MessageCreateEvent.prototype.processCommand(socket, command);
        }

        // Checks to see if the bot was taged in the message and if AI messages in enabled,
        // if AI messages is enabled the message will be passed onto the AI handler.
        if (app.service.ai.isEnabled && message.hasBot()) {
            return app.database.getGuild(socket.message.guild.id).then(transformer => {
                let channel = transformer.getChannel(socket.message.channel.id);

                if (channel.get('ai.enabled', false)) {
                    return app.service.ai.textRequest(socket, message);
                }
            }).catch(err => app.logger.error(
                `Attempted to get AI status for channel "${socket.message.channel.id}" in guild "${socket.message.guild.id}" but failed due to an error: ` + err
            ));
        }

        if (socket.message.isPrivate) {
            return MessageCreateEvent.prototype.sendInformationMessage(socket);
        }
    }

    /**
     * Process command by building the middleware stack and running it.
     *
     * @param  {GatewaySocket} socket   The Discordie gateway socket
     * @param  {Command}       command  The command that should be executed
     * @return {mixed}
     */
    processCommand(socket, command) {
        if (!command.handler.getOptions('allowDM', true) && socket.message.isPrivate) {
            return app.envoyer.sendWarn(socket.message, 'language.errors.cant-run-in-dms');
        }

        let middlewareGroup = command.handler.getOptions('middleware', []);
        let stack = new ProcessCommand(undefined, [], command);
        let param = [];

        if (middlewareGroup.length === 0) {
            return stack.handle(socket, null, command);
        }

        for (let index in middlewareGroup) {
            let split = middlewareGroup[index].split(':');

            let middleware = split[0];
            let args = [];

            if (!app.bot.middleware.hasOwnProperty(middleware)) {
                continue;
            }

            if (split.length > 1) {
                args = split[1].split(',');
            }

            stack = new app.bot.middleware[middleware](stack, param, command);
            param = args;
        }

        return stack.handle(socket, stack.next.bind(stack), ...param);
    }

    /**
     * Sends the information message about how to invite the bot and some basic
     * commands to the user, this method should ONLY be invoked in private
     * messages if the user typed something that wasen't a command,
     * otherwise there will just be too much spam everywhere.
     *
     * @param  {GatewaySocket} socket   The Discordie gateway socket
     * @return {Promise}
     */
    sendInformationMessage(socket) {
        let message = [
            'To invite me to your server, use this link:',
            ':oauth',
            '',
            'You can use `.help` to see a list of all the modules.',
            'You can use `.help -module` to see a list of commands for that module.',
            'For specific command help, use `.help CommandName` (for example `.help !ping`)'
        ];

        if (app.service.ai.isEnabled) {
            message.push(`You can tag me in a message with <@${bot.User.id}> to send me a message that I should process using my AI`);
        }

        message.push('\nAvaIre Support Server: https://discord.gg/gt2FWER');
        return app.envoyer.sendNormalMessage(socket.message, message.join('\n'), {
            oauth: app.config.bot.oauth
        });
    }

    /**
     * Checks to see if the event process should continue, if the message was sent in one
     * of the official Discord servers and the user who sent the message isn't a bot
     * administrator we'll kill the event be returning false.
     *
     * @param  {GatewaySocket} socket   The Discordie gateway socket
     * @return {Boolean}
     */
    shouldContinue(socket) {
        if (socket.message.isPrivate) {
            return true;
        }

        if (!MessageCreateEvent.prototype.isOfficialDiscordServer(socket)) {
            return true;
        }

        return MessageCreateEvent.prototype.isBotOrServerAdmin(socket);
    }

    /**
     * Checks the guild to see it matches any of the official Discord guild IDs.
     *
     * @param  {GatewaySocket} socket   The Discordie gateway socket
     * @return {Boolean}
     */
    isOfficialDiscordServer(socket) {
        switch (socket.message.guild.id) {
            case '81384788765712384':  // Discord API
            case '110373943822540800': // Discord Bots
                return true;

            default:
                return false;
        }
    }

    /**
     * Checks if the users id is in the "botAccess" property in the config.json file
     * or if the user has the MANAGE_SERVER permission node for the given guild.
     *
     * @param  {GatewaySocket} socket   The Discordie gateway socket
     * @return {Boolean}             Returns ture if the user is a bot admin or server admin
     */
    isBotOrServerAdmin(socket) {
        for (let index in app.config.botAccess) {
            if (socket.message.author.id === app.config.botAccess[index]) {
                return true;
            }
        }

        let permmission = app.bot.permissions['general.manage_server'];

        let guildPermissions = socket.message.author.permissionsFor(socket.message.guild);
        let channelPermissions = socket.message.author.permissionsFor(socket.message.channel);

        return guildPermissions[permmission[0]][permmission[1]] || channelPermissions[permmission[0]][permmission[1]];
    }
}

module.exports = MessageCreateEvent;
