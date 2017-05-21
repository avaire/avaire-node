/** @ignore */
const urban = require('relevant-urban');
/** @ignore */
const Command = require('./../Command');

class UrbanDictionaryCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('urban', [], {
            description: 'Get the defenition of a word or sentence from urbandictionary.com'
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
            return urban.random().then(definition => {
                return this.sendUrbanDefinition(message, definition);
            });
        }

        return urban(args.join(' ')).then(definition => {
            return this.sendUrbanDefinition(message, definition);
        }).catch(() => {
            return app.envoyer.sendWarn(message, '<@:userid> I found nothing for `:query`', {
                query: args.join(' ')
            });
        });
    }

    /**
     * Sends the urban dictionary definition to the user.
     *
     * @param  {IMessage}    message     The Discordie message object that triggered the command.
     * @param  {Definition}  definition  The urban word definition object.
     * @return {Promise}
     */
    sendUrbanDefinition(message, definition) {
        let percentage = -1 * ((definition.thumbsDown / definition.thumbsUp * 100) - 100);

        return app.envoyer.sendEmbededMessage(message, {
            color: 0x1D2439,
            url: definition.urbanURL,
            title: definition.word,
            description: definition.definition,
            fields: [
                {
                    name: 'Example',
                    value: definition.example
                }
            ],
            footer: {
                text: `${percentage.toFixed(2)}% percentage of people like this. ${definition.thumbsUp} 👍 ${definition.thumbsDown} 👎`
            }
        });
    }
}

module.exports = UrbanDictionaryCommand;
