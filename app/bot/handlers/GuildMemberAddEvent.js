/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const JoinMessageHandler = require('./utils/JoinLeaveMessageHandler');

/**
 * Emitted after a member has been added to a new guild.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_MEMBER_ADD
 *
 * @extends {EventHandler}
 */
class GuildMemberAddEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        return app.database.getGuild(app.getGuildIdFrom(socket)).then(guild => {
            JoinMessageHandler.send(socket, socket.member, 'welcome', 'Welcome %user% to **%server%!**')
                              .catch(err => app.logger.error(err));

            let member = app.loadProperty(socket, ['member']);
            let autorole = guild.get('autorole', null);

            if (member === null || autorole === null || autorole === undefined) {
                return;
            }

            let role = socket.guild.roles.find(r => r.id === autorole);
            if (role === null || role === undefined) {
                return;
            }

            return member.assignRole(role);
        });
    }
}

module.exports = new GuildMemberAddEvent;
