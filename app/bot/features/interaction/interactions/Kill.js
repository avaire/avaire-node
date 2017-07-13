/** @ignore */
const Interaction = require('../Interaction');

class HighFive extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('kills', [
            'kill', 'kills'
        ], 'https://i.imgur.com/WxD4XMe.gif');
    }
}

module.exports = new HighFive;
