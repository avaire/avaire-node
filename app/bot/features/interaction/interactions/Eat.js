/** @ignore */
const Interaction = require('../Interaction');

class Eat extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('eats', [
            'eat', 'eats'
        ], 'https://i.imgur.com/O7FQ5kz.gif');
    }
}

module.exports = new Eat;
