/** @ignore */
const Interaction = require('../Interaction');

class Hug extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('hugs', [
            'hug', 'hugs'
        ], 'https://i.imgur.com/q9Wkhz4.gif');
    }
}

module.exports = new Hug;
