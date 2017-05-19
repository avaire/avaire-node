/** @ignore */
const Transformer = require('./Transformer');
/** @ignore */
const ChannelTransformer = require('./ChannelTransformer');
/** @ignore */
const GuildTypeTransformer = require('./GuildTypeTransformer');

/**
 * The guild transformer, allows for an easier way
 * to interact with guild database records.
 *
 * @extends {Transformer}
 */
class PlaylistTransformer extends Transformer {

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
        if (data.hasOwnProperty('songs')) {
            try {
                data.songs = JSON.parse(data.songs);
            } catch (err) {
                app.logger.error(err);
                data.songs = [];
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
        if (this.data.songs === undefined || this.data.songs === null) {
            this.data.songs = [];
        }

        return {
            name: this.data.name,
            amount: this.data.songs.length,
            songs: JSON.stringify(this.data.songs),
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
            guild_id: null,
            name: null,
            amount: 0,
            songs: []
        };
    }
}

module.exports = PlaylistTransformer;
