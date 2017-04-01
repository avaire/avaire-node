/** @ignore */
const Transformer = require('./Transformer');

/**
 * The guild transformer, allows for an easier way
 * to interact with guild database records.
 *
 * @extends {Transformer}
 */
class ChannelTransformer extends Transformer {

    /**
     * Converts the transformers data into database bindable data.
     *
     * @override
     *
     * @return {Object}
     */
    toDatabaseBindings() {
        return {
            name: this.data.name,
            local: this.data.local,
            channels: JSON.stringify(this.data.channels),
            updated_at: new Date
        };
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
            modlog: {
                enabled: false,
                message: null
            },
            ai: {
                enabled: true
            },
            slowmode: {
                enabled: false,
                messagesPerLimit: 1,
                messageLimit: 5
            },
            welcome: {
                enabled: false,
                message: null
            },
            goodbye: {
                enabled: false,
                message: null
            }
        };
    }
}

module.exports = ChannelTransformer;
