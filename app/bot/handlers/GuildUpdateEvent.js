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
        let name = app.database.stringifyEmojis(socket.guild.name);

        return app.database.update(app.constants.GUILD_TABLE_NAME, {
            name: name === null ? null : name.toDatabaseFormat(),
            icon: socket.guild.icon,
            owner: socket.guild.owner_id
        }, query => query.where('id', app.getGuildIdFrom(socket)));
    }
}

module.exports = new GuildUpdateEvent;
