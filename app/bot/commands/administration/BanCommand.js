/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/BanModule');

/**
 * Ban Command, allows people with the right
 * permissions to ban people in guilds.
 *
 * @extends {Command}
 */
class BanCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('ban', [], {
            allowDM: false,
            description: 'Bans the mentioned user off the server with the provided reason, all messages the user has sent in the last 7 days will also be deleted in the process, this action will be reported to any channel that has modloging enabled on the server.',
            usage: '<user> [reason]',
            middleware: [
                'throttle.user:2,5',
                'require:general.ban_members'
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

        return Module.ban(sender, message, args, true);
    }
}

module.exports = BanCommand;
