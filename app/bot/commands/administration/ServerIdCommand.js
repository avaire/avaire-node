/** @ignore */
const dot = require('dot-object');
/** @ignore */
const Command = require('./../Command');

class ServerIdCommand extends Command {
    constructor() {
        super('.', 'serverid', ['sid'], {
            allowDM: false,
            description: 'Shows current server ID.'
        });
    }

    onCommand(sender, message, args) {
        return app.envoyer.sendSuccess(message, `<@:userid> :id: of this server is \`${message.guild.id}\``);
    }
}

module.exports = ServerIdCommand;
