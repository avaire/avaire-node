/** @ignore */
const Transformer = require('./Transformer');

/**
 * The user transformer, allows for an easier way
 * to interact with user database records.
 *
 * @extends {Transformer}
 */
class UserTransformer extends Transformer {

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
            user_id: null,
            guild_id: null,
            username: null,
            discriminator: null,
            avatar: null,
            experience: 100
        };
    }
}

module.exports = UserTransformer;
