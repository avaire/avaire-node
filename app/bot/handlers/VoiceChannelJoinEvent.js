/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

class VoiceChannelJoinEvent extends EventHandler {
    handle(socket) {
        let mockMessage = {
            guild: {id: socket.channel.guild_id}
        };

        let playlist = Music.getPlaylist(mockMessage);
        if (playlist.length === 0) {
            return;
        }

        let connectedUsers = socket.channel.members;
        if (connectedUsers.length === 1) {
            return;
        }

        if (!VoiceChannelJoinEvent.prototype.isBotConnected(connectedUsers)) {
            return;
        }

        Music.unpauseStream(mockMessage);
    }

    isBotConnected(users) {
        for (let id in users) {
            if (users[id].id === bot.User.id) {
                return true;
            }
        }

        return false;
    }
}

module.exports = VoiceChannelJoinEvent;
