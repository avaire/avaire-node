/** @ignore */
const Interaction = require('../Interaction');

class Divorce extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('divorces', [
            'divorce', 'divorces'
        ], 'https://i.imgur.com/IgvLWaa.gif');
    }
}

module.exports = new Divorce;
