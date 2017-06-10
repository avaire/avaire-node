/** @ignore */
const os = require('os');
/** @ignore */
const Transformer = require('./../../database/transformers/Transformer');

/**
 * The shard transformer, allows for an easier way
 * to interact with shard database records.
 *
 * @extends {Transformer}
 */
class ShardTransformer extends Transformer {

    /**
     * Converts the transformers data into database bindable data.
     *
     * @return {Object}
     */
    toDatabaseBindings() {
        let networkAddress = '0.0.0.0';
        let network = os.networkInterfaces();
        if (network.hasOwnProperty('eth0')) {
            networkAddress = network.eth0[0].address;
        }

        return {
            id: app.shard.getId(),
            count: app.shard.getCount(),
            address: networkAddress,
            version: app.version,
            users: bot.Users.length,
            guilds: bot.Guilds.length,
            channels: bot.Channels.length
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
            id: app.shard.getId(),
            count: app.shard.getCount(),
            address: null,
            version: app.version,
            users: bot.Users.length,
            guilds: bot.Guilds.length,
            channels: bot.Channels.length
        };
    }
}

module.exports = ShardTransformer;
