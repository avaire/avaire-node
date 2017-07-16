/** @ignore */
const _ = require('lodash');
/** @ignore */
const Interactions = require('./Interactions');

/**
 * Interaction Manage, helps keep track of interactions, and
 * loads them into memory so they're ready to be used.
 */
class InteractionManager {

    /**
     * Get the interaction with the given trigger.
     *
     * @param  {String}  trigger  The trigger for the interaction that should be fetched.
     * @return {Interaction|null}
     */
    getInteraction(trigger) {
        for (let i in Interactions) {
            if (Interactions[i].triggers.indexOf(trigger) > -1) {
                return Interactions[i];
            }
        }
        return null;
    }

    /**
     * Handles the interaction.
     *
     * @param  {GatewaySocket}  socket       The Discordie gateway socket.
     * @param  {Interaction}    interaction  The interaction that should be handled.
     * @param  {Array}          args         The arguments for the interaction.
     * @return {mixed}
     */
    handle(socket, interaction, args) {
        let target = this.getGuildMemberFromId(socket, args[2]);
        if (target === null || target === undefined) {
            return;
        }

        socket.message.channel.sendTyping();
        return interaction.onInteraction(socket.message.member, target, socket.message, _.drop(args, 3));
    }

    /**
     * Gets the guild member object from the given user ID.
     *
     * @param  {GatewaySocket}  socket  The Discordie gateway socket.
     * @param  {string}         userId  The ID of the user that should be fetched.
     * @return {String|null}
     */
    getGuildMemberFromId(socket, userId) {
        userId = userId.substr(2, userId.length - 3);
        if (userId[0] === '!') {
            userId = userId.substr(1);
        }

        return socket.message.guild.members.find(user => {
            return user.id === userId;
        });
    }
}

module.exports = new InteractionManager;
