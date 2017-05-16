/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a member has been banned in a guild.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_BAN_ADD
 *
 * @extends {EventHandler}
 */
class GuildBanAddEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket}  socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        if (app.cache.has(`ban.${socket.guild.id}.${socket.user.id}`, 'memory')) {
            return;
        }

        let guildUser = {
            id: 'Unknown',
            avatar: socket.guild.icon,
            username: socket.guild.name,
            discriminator: ''
        };

        return app.bot.features.modlog.send({
            author: guildUser,
            guild: socket.guild,
            channel: socket.guild.generalChannel
        }, guildUser, socket.user, `:target was permanently banned by a Discord ban action, check the *Audit Log* for more information`);
    }
}

module.exports = new GuildBanAddEvent;
