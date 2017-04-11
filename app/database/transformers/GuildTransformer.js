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
        if (data.hasOwnProperty('channels')) {
            try {
                data.channels = JSON.parse(data.channels);
            } catch (err) {
                app.logger.error(err);
                data.channels = {};
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

    /**
     * Gets the channel with the given id from the guild, if the channel doesn't
     * exists a empty ChannelTransformer will be returned instead.
     *
     * @param  {String}  channelId  The id of the channel.
     * @return {ChannelTransformer}
     */
    getChannel(channelId) {
        return new ChannelTransformer(this.get('channels.' + channelId));
    }
}

module.exports = GuildTransformer;
