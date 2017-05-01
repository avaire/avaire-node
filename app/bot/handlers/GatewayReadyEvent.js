/** @ignore */
const EventHandler = require('./EventHandler');

/**
 * Emitted when the Discordie instance is ready to use. All objects except
 * unavailable guilds and offline members of large guilds (250+ members)
 * will be in cache when this event fires. You can request offline
 * members using client.Users.fetchMembers().
 *
 * See documentation for IUserCollection.fetchMembers.
 *
 * @see http://qeled.github.io/discordie/#/docs/GATEWAY_READY
 * @see http://qeled.github.io/discordie/#/docs/IUserCollection?p=IUserCollection%23fetchMembers
 *
 * @extends {EventHandler}
 */
class GatewayReadyEvent extends EventHandler {

    /**
     * The event-handler that is executed by Discords event dispatcher.
     *
     * @param  {GatewaySocket} socket  The Discordie gateway socket
     * @return {mixed}
     */
    handle(socket) {
        bot.Users.fetchMembers().then(() => {
            app.logger.info(
                `Logged in as ${bot.User.username}#${bot.User.discriminator} (ID: ${bot.User.id})` +
              ` and serving ${bot.Users.length} users in ${bot.Guilds.length} servers.`
            );
        });
    }
}

module.exports = GatewayReadyEvent;
