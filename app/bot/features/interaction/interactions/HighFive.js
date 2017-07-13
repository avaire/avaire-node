/** @ignore */
const Interaction = require('../Interaction');

class HighFive extends Interaction {

    /**
     * Registers the interaction name, trigger and image url that should
     * be used to generate the interaction message when it is invoked.
     */
    constructor() {
        super('high fives', [
            'high-five', 'high-fives', 'highfive', 'highfives'
        ], 'https://media.giphy.com/media/x58AS8I9DBRgA/giphy.gif');
    }
}

module.exports = new HighFive;
