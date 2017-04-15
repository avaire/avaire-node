/** @ignore */
const dot = require('dot-object');
/** @ignore */
const Command = require('./../Command');

/**
 * Server ID Command, gets the server id.
 *
 * @extends {Command}
 */
class ServerIdCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
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
