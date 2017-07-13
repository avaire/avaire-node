/** @ignore */
const Interaction = require('../Interaction');

class Cuddle extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('cuddles', [
            'cuddle', 'cuddles'
        ], 'http://i.imgur.com/0yAIWbg.gif');
    }
}

module.exports = new Cuddle;
