
/**
 * Update guild channels event handler, this class handels updating the guild
 * channels data for the given guild on channel update events, like when a
 * new channel is created, or existing channels are updated or deleted.
 */
class UppdateGuildChannelsHandler {

    /**
     * Handles the uppdate guild channels request.
     *
     * @param  {GatewaySocket}  socket   The channel related Discordie gateway socket.
     * @param  {mixed}          channel  The channel data that was affected by the event.
     * @return {mixed}
     */
    handle(socket, channel) {
        if (channel.type !== 0) {
            return;
        }

        let guild = bot.Guilds.get(app.getGuildIdFrom(channel));
        if (guild === null || guild === undefined) {
            return app.logger.error('Failed to resolve guild from guild ID in a channel event, guild ID: ', app.getGuildIdFrom(channel));
        }

        let channels = this.getChannels(guild);

        return app.database.update(app.constants.GUILD_TABLE_NAME, {
            channels_data: JSON.stringify(channels)
        }, query => query.where('id', app.getGuildIdFrom(guild))).catch(err => {
            return app.logger.raven(err, {
                message: 'Failed to update guild channel data',
                guild, channels
            });
        });
    }

    /**
     * Gets an array of all the text channels from the given guild.
     *
     * @param  {IGuild}  guild  The guild the channels should be fetched from.
     * @return {Array}
     */
    getChannels(guild) {
        let channels = [];
        let textChannels = guild.textChannels;

        for (let i = 0; i < textChannels.length; i++) {
            let c = textChannels[i];

            let channelName = app.database.stringifyEmojis(c.name);

            channels.push({
                id: c.id,
                name: channelName === null ? 'Invalid Channel Name' : channelName.toDatabaseFormat(),
                position: c.position
            });
        }

        return channels;
    }
}

module.exports = new UppdateGuildChannelsHandler;
