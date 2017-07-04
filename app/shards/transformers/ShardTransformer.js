/** @ignore */
const os = require('os');
/** @ignore */
const Music = require('./../../bot/commands/music/MusicHandler');
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
            channels: bot.Channels.length,
            voices: bot.VoiceConnections.length,
            songs: this.getSongsInQueue()
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

    /**
     * Loops through all the songs currently in the queue and adds them up.
     *
     * @return {Number}
     */
    getSongsInQueue() {
        let songsInQueue = 0;
        for (let guildId in Music.queues) {
            songsInQueue += Music.queues[guildId].length;
        }
        return songsInQueue;
    }
}

module.exports = ShardTransformer;
