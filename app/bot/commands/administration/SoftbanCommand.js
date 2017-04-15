/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/BanModule');

class SoftbanCommand extends Command {
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
