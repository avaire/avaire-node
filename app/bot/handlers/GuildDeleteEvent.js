/** @ignore */
const EventHandler = require('./EventHandler');

class GuildDeleteEvent extends EventHandler {
    handle(socket) {
        app.logger.info(`Left guild with an ID of ${socket.data.id} called: ${socket.data.name}`);

        let avaireCentral = bot.Guilds.find(guild => guild.id === '284083636368834561');

        if (typeof avaireCentral === 'undefined' || avaireCentral === null) {
            return;
        }

        let channel = avaireCentral.textChannels.find(channel => channel.name === 'bot-activity');
        if (typeof channel === 'undefined') {
            return;
        }

        return app.envoyer.sendEmbededMessage(channel, {
            title: 'Left/Was kicked from Server',
            color: 0xD91616,
            fields: [
                {
                    name: 'Name',
                    value: socket.data.name
                },
                {
                    name: 'ID',
                    value: socket.data.id
                },
                {
                    name: 'Owner ID',
                    value: socket.data.owner_id
                }
            ]
        });
    }
}

module.exports = new GuildDeleteEvent;
