/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/BanModule');

/**
 * SoftBan Command, allows users with the right permissions to ban other users
 * with a lower role then themselves, soft banning people doesn't delete
 * messages, it just bans the user off the server.
 *
 * @extends {Command}
 */
class SoftbanCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('.', 'softban', ['sban'], {
            allowDM: false,
            description: 'Bans the mentioned user off the server with the provided reason, this action will be reported to any channel that has modloging enabled on the server.',
            usage: [
                '<user> [reason]'
            ],
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
            return app.envoyer.sendWarn(message, 'language.errors.missing-arguments', {
                command: this.getPrefix() + this.getTriggers()[0]
            });
        }

        return Module.ban(sender, message, args, false);
    }
}

module.exports = SoftbanCommand;
