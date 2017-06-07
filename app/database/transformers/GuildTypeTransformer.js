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
     * Prepares the transformers data.
     *
     * @override
     *
     * @param  {Object} data  The data that should be transformed.
     * @param  {Lodash} _     The lodash instance.
     * @return {Object}
     */
    prepare(data, _) {
        if (data.hasOwnProperty('limits')) {
            try {
                data.limits = JSON.parse(data.limits);
            } catch (err) {
                app.logger.error(err);
                data.limits = {};
            }
        }

        return data;
    }

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
                    lists: 5,
                    songs: 30
                },
                aliases: 20
            }
        };
    }
}

module.exports = GuildTypeTransformer;
