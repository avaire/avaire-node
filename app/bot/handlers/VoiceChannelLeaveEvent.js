/** @ignore */
const EventHandler = require('./EventHandler');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

class VoiceChannelLeaveEvent extends EventHandler {
    handle(socket) {
        let mockMessage = {
            guild: {id: socket.channel.guild_id}
        };

        let playlist = Music.getPlaylist(mockMessage);
        if (playlist.length === 0) {
            return;
        }

        let connectedUsers = socket.channel.members;
        if (connectedUsers.length !== 1) {
            return;
        }

        if (connectedUsers[0].id !== bot.User.id) {
            return;
        }

        Music.getVoiceConnection(mockMessage)
             .voiceConnection
             .getEncoderStream()
             .cork();
    }
}

module.exports = VoiceChannelLeaveEvent;
