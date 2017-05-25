/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const CommandHandler = require('./../CommandHandler');

/**
 * Aliases command, used to list all existing command aliases.
 *
 * @extends {Command}
 */
class AliasesCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('aliases', ['aliaslist'], {
            allowDM: false,
            description: 'Lists all the existing command aliases.',
            middleware: [
                'throttle.user:2,5',
                'require:general.manage_server'
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
        return app.database.getGuild(message.guild.id).then(guild => {
            let aliasesMessage = [];
            let aliases = guild.get('aliases', {});
            for (let token in aliases) {
                aliasesMessage.push(`\`${token}\` => \`${aliases[token]}\``);
            }

            return app.envoyer.sendEmbededMessage(message, {
                title: 'List of Aliases',
                color: app.envoyer.colors.success,
                description: aliasesMessage.join('\n')
            });
        });
    }
}

module.exports = AliasesCommand;
