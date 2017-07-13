/** @ignore */
const Interaction = require('../Interaction');

class Pat extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('pats', [
            'pat', 'pats'
        ], 'https://i.imgur.com/oynHZmT.gif');
    }
}

module.exports = new Pat;
