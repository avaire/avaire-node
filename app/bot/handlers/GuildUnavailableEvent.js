/** @ignore */
const EventHandler = require('./EventHandler');

class GuildUnavailableEvent extends EventHandler {
    handle(socket) {
        //
    }
}

module.exports = new GuildUnavailableEvent;
