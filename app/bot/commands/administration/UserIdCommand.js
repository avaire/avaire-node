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

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        let user = sender;

        if (message.mentions.length > 0) {
            user = message.mentions[0];
        }

        return app.envoyer.sendSuccess(message, `<@:userid> :id: of the user **${user.username}#${user.discriminator}** is \`${user.id}\``);
    }
}

module.exports = ServerIdCommand;
