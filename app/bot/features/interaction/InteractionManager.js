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
}

module.exports = new InteractionManager;
