/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted after a user guild profile is updated, this could be because
 * of a role the user was added or removed from, the user changed
 * their nickname, and possibly some other stuff as well.
 *
 * @see http://qeled.github.io/discordie/#/docs/GUILD_MEMBER_UPDATE
 *
 * @extends {EventHandler}
 */
class GuildMemberUpdateEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket}  socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        //
    }
}

module.exports = new GuildMemberUpdateEvent;
