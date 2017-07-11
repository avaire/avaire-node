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
        app.shard.logger.delete({
            description: `${socket.data.name} (ID: ${socket.data.id})`
        });

        app.database.update(app.constants.GUILD_TABLE_NAME, {
            leftguild_at: new Date
        }, query => query.where('id', socket.data.id))
            .catch(err => app.logger.raven(err, {
                guild: socket.data
            }));
    }
}

module.exports = new GuildDeleteEvent;
