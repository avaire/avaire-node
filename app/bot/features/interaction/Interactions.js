/** @ignore */
const directory = require('require-directory');
/** @ignore */
const _ = require('lodash');

/**
 * The full list of interactions.
 *
 * @type {Array}
 */
let interactions = [];

_.each(directory(module, `./interactions`), (Interaction, key) => {
    interactions.push(Interaction);
});

module.exports = interactions;
