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
                'require.user:general.manage_server'
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
        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let aliases = guild.get('aliases', {});

            if (Object.keys(aliases).length === 0) {
                return app.envoyer.sendEmbededMessage(message, {
                    title: app.lang.get(message, 'commands.administration.aliases.title'),
                    color: app.envoyer.colors.warn,
                    description: app.lang.get(message, 'commands.administration.aliases.empty')
                }, {
                    command: this.getPrefix(message) + app.bot.commands.AliasCommand.triggers[0]
                });
            }

            let pageNumber = 1;
            if (args.length > 0) {
                pageNumber = parseInt(args[0], 10);
            }

            if (isNaN(pageNumber) || pageNumber < 1) {
                pageNumber = 1;
            }

            let pages = Math.ceil(Object.keys(aliases).length / 10);
            if (pageNumber > pages) {
                pageNumber = pages;
            }

            let keys = Object.keys(aliases);
            let start = 10 * (pageNumber - 1);
            let aliasesKeys = [];
            for (let i = start; i < start + 10; i++) {
                if (keys.length <= i) {
                    break;
                }

                let song = keys[i];
                aliasesKeys.push(keys[i]);
            }

            let aliasesMessage = [];
            for (let i in aliasesKeys) {
                aliasesMessage.push(`\`${aliasesKeys[i]}\` => \`${aliases[aliasesKeys[i]]}\``);
            }

            return app.envoyer.sendEmbededMessage(message, {
                title: app.lang.get(message, 'commands.administration.aliases.title'),
                color: app.envoyer.colors.success,
                description: aliasesMessage.join('\n') + '\n\n' +
                    app.lang.get(message, 'commands.administration.aliases.note')
            }, {
                command: this.getCommandTrigger(message),
                page: pageNumber, pages
            });
        });
    }
}

module.exports = AliasesCommand;
