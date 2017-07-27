/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a role has been deleted for a guild/server.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_ROLE_DELETE
 *
 * @extends {EventHandler}
 */
class GuildRoleDeleteEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket}  socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        return app.database.getGuild(app.getGuildIdFrom(socket)).then(guild => {
            let claimableRoles = guild.get('claimable_roles', {});
            if (!claimableRoles.hasOwnProperty(socket.roleId)) {
                return;
            }

            delete claimableRoles[socket.roleId];
            guild.data.claimable_roles = claimableRoles;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                claimable_roles: JSON.stringify(claimableRoles)
            }, query => query.where('id', app.getGuildIdFrom(socket)));
        });
    }
}

module.exports = new GuildRoleDeleteEvent;
