/** @ignore */
const Transformer = require('./Transformer');

/**
 * The guild transformer, allows for an easier way
 * to interact with guild database records.
 *
 * @extends {Transformer}
 */
class GuildTypeTransformer extends Transformer {

    /**
     * The default data objects for the transformer.
     *
     * @override
     *
     * @return {Object}
     */
    defaults() {
        return {
            name: 'Default'
        };
    }
}

module.exports = GuildTypeTransformer;
