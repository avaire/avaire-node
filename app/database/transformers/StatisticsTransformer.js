/** @ignore */
const Transformer = require('./Transformer');

/**
 * The statistics transformer, allows for an easier way
 * to interact with statistics database records.
 *
 * @extends {Transformer}
 */
class StatisticsTransformer extends Transformer {

    /**
     * The default data objects for the transformer.
     *
     * @override
     *
     * @return {Object}
     */
    defaults() {
        return {
            respects: 0
        };
    }
}

module.exports = StatisticsTransformer;
