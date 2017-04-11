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

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        return app.envoyer.sendSuccess(message, `<@:userid> :id: of this server is \`${message.guild.id}\``);
    }
}

module.exports = ServerIdCommand;
