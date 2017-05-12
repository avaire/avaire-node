/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/BroadcastModule');

/**
 * Broadcast Command, allows users with the right permissions to
 * broadcast a message that is broadcasted to all the general
 * channels in the guilds that the bot is appart of.
 *
 * @extends {Command}
 */
class BroadcastCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('broadcast', ['bc'], {
            description: 'Prepares a broadcast message and returns hash ID of the message, as well as how it\'s going to look like, to send the message use `;broadcastsend <hash>`',
            usage: '<message>',
            middleware: [
                'isBotAdmin'
            ]
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        let obj = Module.prepareMessage(message, args);

        return app.envoyer.sendInfo(message, `ID: ${obj.hash}\n` +
            `-------------------------------------------------------------------------------------------------\n` +
            `\n${obj.broadcast}`);
    }
}

module.exports = BroadcastCommand;
