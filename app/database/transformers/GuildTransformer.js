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

        if (data.hasOwnProperty('prefixes')) {
            try {
                data.prefixes = JSON.parse(data.prefixes);
            } catch (err) {
                app.logger.error(err);
                data.prefixes = {};
            }
        }

        if (data.hasOwnProperty('aliases')) {
            try {
                data.aliases = JSON.parse(data.aliases);
            } catch (err) {
                app.logger.error(err);
                data.aliases = {};
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
            icon: this.data.icon,
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
            type: 0,
            owner: null,
            name: null,
            icon: null,
            local: null,
            channels: {},
            prefixes: null,
            aliases: null
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

    /**
     * Gets the guild type transformer for the guild type.
     *
     * @return {GuildTypeTransformer}
     */
    getType() {
        let id = this.get('type', 0);

        let guildTypes = app.cache.get('database.guild-types', [], 'memory');
        for (let i in guildTypes) {
            if (guildTypes[i].get('id') === id) {
                return guildTypes[i];
            }
        }
        return new GuildTypeTransformer;
    }

    /**
     * Gets the prefix for the given module.
     *
     * @param  {String}  moduleName  The name of the module that the prefix should be fetched for.
     * @return {String|null}
     */
    getPrefix(moduleName) {
        return this.get('prefixes.' + moduleName, null);
    }
}

module.exports = GuildTransformer;
