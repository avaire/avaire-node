
class JoinLeaveMessageHandler {

    /**
     * Sends a welcome or goodbye message, depending on the given module.
     *
     * @param  {GatewaySocket} socket          The Discordie gateway socket.
     * @param  {IGuildMember}  member          The guild member object.
     * @param  {String}        module          The module that should be used.
     * @param  {String}        defaultMessage  The default message.
     * @return {Promise}
     */
    send(socket, member, module, defaultMessage) {
        let guild = socket.guild;
        let chain = [];

        // Attempts to load the guild settings and channels from the database,
        // if the guild data is already cached in memory the cached data
        // will be returned instead to speed up the process.
        return app.database.getGuild(app.getGuildIdFrom(socket)).then(transformer => {
            let channels = transformer.get('channels');

            for (let id in channels) {
                let channel = transformer.getChannel(id);

                if (!channel.get(module + '.enabled', false)) {
                    continue;
                }

                let textChannel = guild.textChannels.find(textChannel => textChannel.id === id);

                if (typeof textChannel === 'undefined') {
                    continue;
                }

                let message = channel.get(module + '.message', defaultMessage);
                chain.push(app.envoyer.sendNormalMessage(textChannel, this.prepareMessage(message, member, textChannel, guild)));
            }

            return Promise.all(chain);
        });
    }

    /**
     * Prepares the message by replacing any placeholders in the
     * message with the actually value of the placeholder.
     *
     * @param  {String}        message  The message that should be formatted.
     * @param  {IGuildMember}  member   The guild member that joined/left the guild.
     * @param  {IChannel}      channel  The channel the message is about to be sent in.
     * @param  {IGuild}        guild    The guild the message is about to be sent in.
     * @return {String}
     */
    prepareMessage(message, member, channel, guild) {
        message = message.replace(/%user%/gi, `<@${member.id}>`);
        message = message.replace(/%userid%/gi, member.id);
        message = message.replace(/%username%/gi, member.username);
        message = message.replace(/%userdisc%/gi, member.discriminator);

        message = message.replace(/%channel%/gi, `<#${channel.id}>`);
        message = message.replace(/%channelid%/gi, channel.id);
        message = message.replace(/%channelname%/gi, channel.name);

        message = message.replace(/%server%/gi, guild.name);
        message = message.replace(/%servername%/gi, guild.name);
        message = message.replace(/%serverid%/gi, app.getGuildIdFrom(guild));

        return message;
    }
}

module.exports = new JoinLeaveMessageHandler;
