/** @ignore */
const Interaction = require('../Interaction');

class Slap extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('slaps', [
            'slap', 'slaps'
        ], 'https://i.imgur.com/rfy8z2K.gif');
    }
}

module.exports = new Slap;
