/** @ignore */
const dot = require('dot-object');
/** @ignore */
const Command = require('./../Command');

/**
 * Language Command, allows server managers to set the
 * language the bot uses in the current guild.
 *
 * @extends {Command}
 */
class LanguageCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('language', ['lang'], {
            allowDM: false,
            description: 'Allows you to change the language the bot will use on this server.',
            usage: [
                '',
                '[local]'
            ],
            middleware: [
                'require.user:general.manage_server',
                'throttle.user:1,3'
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
            return this.showLanguageMessage(message);
        }

        let local = args[0].toLowerCase();
        if (!app.lang.getFiles().hasOwnProperty(local)) {
            return app.envoyer.sendWarn(message, 'commands.administration.language.invalid', {
                local
            });
        }

        return app.database.getGuild(message.guild.id).then(transformer => {
            transformer.data.local = local;

            app.database.update(app.constants.GUILD_TABLE_NAME, transformer.toDatabaseBindings(), query => {
                return query.where('id', message.guild.id);
            });

            return app.envoyer.sendSuccess(message, 'language.selected');
        });
    }

    /**
     * Displays the currently selected language message.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    showLanguageMessage(message) {
        let command = this.getPrefix(message) + this.getTriggers()[0];

        return app.database.getGuild(message.guild.id).then(transformer => {
            let local = typeof transformer.get('local') === 'string' ? transformer.get('local').toUpperCase() : 'Default';
            let languages = Object.keys(app.lang.getFiles()).map(lang => {
                return lang.toUpperCase();
            });

            let note = app.lang.get(message, 'commands.administration.language.note', {
                command: this.getPrefix(message) + this.getTriggers()[0],
                default: app.lang.defaultLocal.toUpperCase()
            });

            return message.channel.sendMessage('', false, {
                color: 0x3498DB,
                url: app.config.bot.oauth,
                fields: [
                    {
                        name: app.lang.get(message, 'commands.administration.language.selected'),
                        value: '`' + local + '`'
                    },
                    {
                        name: app.lang.get(message, 'commands.administration.language.available'),
                        value: '`' + languages.join('`, `') + '`\n\n' + note
                    }
                ]
            });
        });
    }
}

module.exports = LanguageCommand;
