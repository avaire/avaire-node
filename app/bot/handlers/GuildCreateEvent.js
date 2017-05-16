/** @ignore */
const EventHandler = require('./EventHandler');

class GuildCreateEvent extends EventHandler {
    handle(socket) {
        app.logger.info(`Joined guild with an ID of ${socket.guild.id} called: ${socket.guild.name}`);

        let avaireCentral = bot.Guilds.find(guild => guild.id === '284083636368834561');

        if (typeof avaireCentral === 'undefined' || avaireCentral === null) {
            return;
        }

        let channel = avaireCentral.textChannels.find(channel => channel.name === 'bot-activity');
        if (typeof channel === 'undefined') {
            return;
        }

        let owner = bot.Users.get(socket.guild.owner_id);

        return app.envoyer.sendEmbededMessage(channel, {
            title: 'Join Server',
            color: 0x16D940,
            fields: [
                {
                    name: 'Name',
                    value: socket.guild.name
                },
                {
                    name: 'ID',
                    value: socket.guild.id
                },
                {
                    name: 'Members',
                    value: socket.guild.member_count
                },
                {
                    name: 'Owner ID',
                    value: socket.guild.owner_id
                },
                {
                    name: 'Owner',
                    value: `${owner.username}#${owner.discriminator}`
                }
            ]
        });
    }
}

module.exports = new GuildCreateEvent;
