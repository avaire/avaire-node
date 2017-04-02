/** @ignore */
const dot = require('dot-object');
/** @ignore */
const Command = require('./../Command');

class ServerIdCommand extends Command {
    constructor() {
        super('.', 'userid', ['uid'], {
            allowDM: false,
            description: 'Shows user ID.'
        });
    }

    onCommand(sender, message, args) {
        let user = sender;

        if (message.mentions.length > 0) {
            user = message.mentions[0];
        }

        return app.envoyer.sendSuccess(message, `<@:userid> :id: of the user **${user.username}#${user.discriminator}** is \`${user.id}\``);
    }
}

module.exports = ServerIdCommand;
