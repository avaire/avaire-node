/** @ignore */
const Interaction = require('../Interaction');

class Kiss extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('kisses', [
            'kiss', 'kisses'
        ], 'https://i.imgur.com/S7mwPfE.gif');
    }
}

module.exports = new Kiss;
