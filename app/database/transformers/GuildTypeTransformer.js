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
            name: 'Default',
            limits: {
                playlist: {
                    lists: 3,
                    songs: 10
                },
                aliases: 20
            }
        };
    }
}

module.exports = GuildTypeTransformer;
