/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a new guild instance is added to the bot instance, this is
 * either when a new guild is created or the bot joins a pre-existing guild.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_CREATE
 *
 * @extends {EventHandler}
 */
class GuildCreateEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        app.logger.info(`Joined guild with an ID of ${app.getGuildIdFrom(socket)} called: ${socket.guild.name}`);

        app.database.update(app.constants.GUILD_TABLE_NAME, {
            leftguild_at: null
        }, query => query.where('id', app.getGuildIdFrom(socket)))
            .catch(err => app.logger.error(err));

        if (app.permission.has(bot.User, socket.guild.generalChannel, 'text.send_messages')) {
            this.sendWelcomeMessage(socket);
        }

        if (isEnvironmentInDevelopment()) {
            return;
        }

        let avaireCentral = bot.Guilds.find(guild => app.getGuildIdFrom(guild) === '284083636368834561');

        if (typeof avaireCentral === 'undefined' || avaireCentral === null) {
            return;
        }

        let channel = avaireCentral.textChannels.find(channel => channel.name === 'bot-activity');
        if (typeof channel === 'undefined') {
            return;
        }

        let owner = bot.Users.get(socket.guild.owner_id);

        return app.envoyer.sendEmbededMessage(channel, {
            title: 'Join Server',
            color: 0x16D940,
            fields: [
                {
                    name: 'Name',
                    value: socket.guild.name
                },
                {
                    name: 'ID',
                    value: app.getGuildIdFrom(socket)
                },
                {
                    name: 'Members',
                    value: socket.guild.member_count
                },
                {
                    name: 'Owner ID',
                    value: socket.guild.owner_id
                },
                {
                    name: 'Owner',
                    value: `${owner.username}#${owner.discriminator}`
                }
            ]
        });
    }

    /**
     * Sends a welcome message to the guild the bot just
     * joined, letting them know how to use the bot.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {Promise}
     */
    sendWelcomeMessage(socket) {
        return app.envoyer.sendEmbededMessage(socket.guild.generalChannel, {
            color: 0xE91E63,
            title: `Hi there, I'm ${bot.User.username}`,
            description: [
                'Thank you for inviting me to your server, it\'s nice to meet you 👋',
                'To get started, use `.help` to see a list of my commands, for more in-depth guides and information you can check out my [documentation](https://avairebot.com/docs).',
                '',
                '**Documentation**',
                'https://avairebot.com/docs',
                '',
                '**AvaIre Support Server**',
                'https://avairebot.com/support'
            ].join('\n')
        });
    }
}

module.exports = new GuildCreateEvent;
