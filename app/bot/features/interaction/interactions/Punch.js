/** @ignore */
const Interaction = require('../Interaction');

class Punch extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('punches', [
            'punch', 'punches'
        ], 'https://i.imgur.com/WKj10Dc.gif');
    }
}

module.exports = new Punch;
