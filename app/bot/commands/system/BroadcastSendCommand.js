/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/BroadcastModule');

/**
 * Broadcast Send Command, allows users with the right permissions to parse
 * a hash to the command, if the hash exits the message linked to the
 * hash will be broadcasted to all the guilds the bot is apart of.
 *
 * @extends {Command}
 */
class BroadcastSendCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('broadcastsend', ['bcsend'], {
            usage: '<hash>',
            middleware: [
                'isBotAdmin'
            ]
        });

        /**
         * [preparedMessages description]
         *
         * @type {Object}
         */
        this.preparedMessages = {};
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

        if (!Module.hasProperty(args[0])) {
            return app.envoyer.sendWarn(message, 'Invalid or expired `hash` given.');
        }

        return Module.sendMessage(args[0]);
    }
}

module.exports = BroadcastSendCommand;
