
class JoinLeaveMessageHandler {
    send(socket, member, module, defaultMessage) {
        let guild = socket.guild;

        // Attempts to load the guild settings and channels from the database,
        // if the guild data is already cached in memory the cached data
        // will be returned instead to speed up the process.
        return app.database.getGuild(guild.id).then(transformer => {
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
                textChannel.sendMessage(this.prepareMessage(message, member, textChannel, guild));
            }
        });
    }

    prepareMessage(message, member, channel, guild) {
        message = message.replace('%user%', `<@${member.id}>`);
        message = message.replace('%userid%', member.id);
        message = message.replace('%username%', member.username);

        message = message.replace('%channel%', channel.name);
        message = message.replace('%guild%', guild.name);

        return message;
    }
}

module.exports = new JoinLeaveMessageHandler;
