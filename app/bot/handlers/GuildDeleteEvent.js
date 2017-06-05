/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a guild is removed from the bot instance, this is happens
 * when the bot leaves by itself, or the bot was kicked from a server.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_DELETE
 *
 * @extends {EventHandler}
 */
class GuildDeleteEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        app.logger.info(`Left guild with an ID of ${socket.data.id} called: ${socket.data.name}`);

        app.database.update(app.constants.GUILD_TABLE_NAME, {
            leftguild_at: new Date
        }, query => query.where('id', socket.data.id))
            .catch(err => app.logger.error(err));

        if (!app.process.isReady) {
            return;
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

        return app.envoyer.sendEmbededMessage(channel, {
            title: 'Left/Was kicked from Server',
            color: 0xD91616,
            fields: [
                {
                    name: 'Name',
                    value: socket.data.name
                },
                {
                    name: 'ID',
                    value: socket.data.id
                },
                {
                    name: 'Owner ID',
                    value: socket.data.owner_id
                }
            ]
        });
    }
}

module.exports = new GuildDeleteEvent;
