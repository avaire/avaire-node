/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

/** @ignore */
let categories = _.orderBy(require('./../Categories'));

/**
 * Command Modules Command, sends the status for all the command modules
 * and their statuses for the current channel and server if any of the
 * command modules are disabled globally.
 *
 * @extends {Command}
 */
class CommandModulesCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('modules', ['module', 'mod'], {
            allowDM: false,
            usage: '[channel]',
            middleware: [
                'require.user:general.administrator',
                'throttle.user:2,5'
            ]
        });

        this.categoryNames = _.map(categories, category => category.name);
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
            let channelId = message.channel.id;
            if (args.length > 0) {
                channelId = this.getChannelId(message, args[0]);
            }

            let fields = [];
            for (let i in this.categoryNames) {
                fields.push(`${this.getStatusFor(guild, channelId, this.categoryNames[i])}`);
            }

            let status = [
                `${this.enabledIcon} Enabled`,
                `${this.disabledIcon} Disabled in Channel`,
                `${this.disabledGloballyIcon} Disabled Globally`
            ];

            return app.envoyer.sendEmbededMessage(message, {
                title: `Command Modules Status for #${bot.Channels.get(channelId).name}`,
                description: `${status.join('   ')}\n\n${fields.join('\n')}`,
                color: 0x3498DB
            });
        });
    }

    /**
     * Gets the status for the current channel and guild.
     *
     * @param  {GuildTransformer}  guild      The database guild transformer for the current guild.
     * @param  {String}            channelId  The ID of the channel the command was run in.
     * @param  {String}            module     The module the command was triggered for.
     * @return {String}
     */
    getStatusFor(guild, channelId, module) {
        if (!guild.get(`modules.all.${module.toLowerCase()}`, true)) {
            return this.disabledGloballyIcon + module;
        }

        if (!guild.get(`modules.${channelId}.${module.toLowerCase()}`, true)) {
            return this.disabledIcon + module;
        }
        return this.enabledIcon + module;
    }

    /**
     * Gets the channel ID from the given message.
     *
     * @param  {IMessage} message        The Discordie message object that triggered the command.
     * @param  {String}   channelString  The channel argument given to the command.
     * @return {String|null}
     */
    getChannelId(message, channelString) {
        let id = channelString.substr(2, channelString.length - 3);
        let channels = message.guild.channels;
        for (let i in channels) {
            let channel = channels[i];
            if (channel.type === 0 && channel.id === id) {
                return id;
            }
        }
        return message.channel.id;
    }

    /**
     * Gets the enabled emoji icon.
     *
     * @return {String}
     */
    get enabledIcon() {
        return '<:online:324986081378435072>';
    }

    /**
     * Gets the disabled emoji icon.
     *
     * @return {String}
     */
    get disabledIcon() {
        return '<:away:324986135346675712>';
    }

    /**
     * Gets the disabled globally emoji icon.
     *
     * @return {String}
     */
    get disabledGloballyIcon() {
        return '<:dnd:324986174806425610>';
    }
}

module.exports = CommandModulesCommand;
