/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Request online players intent handler, this is used when the ai
 * thinks the user requested to know how many people are online.
 *
 * @extends {IntentHandler}
 */
class RequestOnlinePlayers extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        let maxPlayers = this.getMessage().guild.member_count;
        let onlinePlayers = 0;

        _.each(this.getMessage().guild.members, function (member) {
            if (member.status !== 'offline') {
                onlinePlayers++;
            }
        });

        app.envoyer.sendSuccess(this.getMessage(), `There are **:online** online people out of **:total** people on the server.`, {
            online: onlinePlayers,
            total: maxPlayers
        });
    }
}

module.exports = RequestOnlinePlayers;
