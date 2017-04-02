/** @ignore */
const Transformer = require('./Transformer');
/** @ignore */
const ChannelTransformer = require('./ChannelTransformer');

/**
 * The guild transformer, allows for an easier way
 * to interact with guild database records.
 *
 * @extends {Transformer}
 */
class GuildTransformer extends Transformer {

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
        data.channels = {};

        if (data.hasOwnProperty('channels')) {
            try {
                data.channels = JSON.parse(data.channels);
            } catch (err) {
                // We don't really give a shit if the channel JSON didn't parse correctly or not, if it didn't parse
                // its because the json that was stored was not saved correctly, or it was NULL or undefined.
            }
        }

        return data;
    }

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
            id: null,
            owner: null,
            name: null,
            local: null,
            channels: {}
        };
    }

    getChannel(channelId) {
        return new ChannelTransformer(this.get('channels.' + channelId));
    }
}

module.exports = GuildTransformer;
