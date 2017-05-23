/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when a guild instance the bot is connected to is updated.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_UPDATE
 *
 * @extends {EventHandler}
 */
class GuildUpdateEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        return app.database.update(app.constants.GUILD_TABLE_NAME, {
            name: socket.guild.name,
            icon: socket.guild.icon,
            owner: socket.guild.owner_id
        }, query => query.where('id', socket.guild.id));
    }
}

module.exports = new GuildUpdateEvent;
