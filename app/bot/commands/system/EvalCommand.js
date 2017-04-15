/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');

class EvalCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super(';', 'eval', [], {
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
        try {
            let evalObject = eval(args.join(' '));

            message.channel.sendMessage('```xl\n' + this.inspect(evalObject) + '\n```').then(message => {
                if (evalObject !== undefined && evalObject !== null && typeof evalObject.then === 'function') {
                    evalObject.then(() => message.edit('```xl\n' + this.inspect(evalObject) + '\n```'))
                              .catch(err => message.edit('```xl\n' + this.inspect(err) + '\n```'));
                }
            });
        } catch (err) {
            message.channel.sendMessage('```xl\n' + err + '\n```');
        }
    }

    inspect(message) {
        message = util.inspect(message, {depth: 1});
        message = this.hideElemenets(message);

        return message.limit(1900);
    }

    hideElemenets(message) {
        message = message.replace(new RegExp(app.config.bot.token, 'gim'), '----- BOT TOKEN IS HIDDEN -----');
        message = message.replace(/(\n\s+|)+{\s+(type|database|host|user|password)+([\s\S]*?)}/igm, '\'----- BOT DATABASE IS HIDDEN -----\'');
        message = message.replace(/(\n\s+|)+{\s+(google|apiai)+([\s\S]*?)}/igm, '\'----- API KEYS IS HIDDEN -----\'');

        return message;
    }
}

module.exports = EvalCommand;
