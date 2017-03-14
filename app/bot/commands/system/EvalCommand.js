/** @ignore */
const util = require('util');
/** @ignore */
const Command = require('./../Command');

class EvalCommand extends Command {
    constructor() {
        super('!', 'eval', [], {
            middleware: [
                'isBotAdmin'
            ]
        });
    }

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

        if (message.length > 1900) {
            return message.substr(0, 1897) + '...';
        }

        return message;
    }

    hideElemenets(message) {
        message = message.replace(new RegExp(app.config.bot.token, 'gim'), '----- BOT TOKEN IS HIDDEN -----');
        message = message.replace(/(\n\s+|)+{\s+(type|database|host|user|password)+([\s\S]*?)}/igm, '\'----- BOT DATABASE IS HIDDEN -----\'');
        message = message.replace(/(\n\s+|)+{\s+(google|apiai)+([\s\S]*?)}/igm, '\'----- API KEYS IS HIDDEN -----\'');

        return message;
    }
}

module.exports = EvalCommand;
