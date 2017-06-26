/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

/** @ignore */
let categories = _.orderBy(require('./../Categories'));

/**
 * Toggle Module Command, allows users to toggle command modules on or off for
 * any given text channel, or globally for all channels on their server.
 *
 * @extends {Command}
 */
class ToggleModuleCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('togglemodule', ['tmod'], {
            allowDM: false,
            usage: '<module> [channel|all] [on|off]',
            middleware: [
                'require.user:general.administrator',
                'throttle.user:2,5'
            ]
        });

        /**
         * The list of command module/category names.
         *
         * @type {Array}
         */
        this.categoryNames = _.map(categories, category => category.name.toLowerCase());
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
        if (args.length < 1) {
            return this.sendMissingArguments(message);
        }

        let moduleName = args.shift();
        let module = this.getModule(moduleName);
        if (module === null) {
            return app.envoyer.sendWarn(message, 'commands.administration.togglemodule.invalid', {
                module: moduleName
            });
        }

        if (module === 'administration') {
            return app.envoyer.sendWarn(message, 'commands.administration.togglemodule.disable-admin');
        }

        let channel = 'all';
        let secondArgument = args.shift();
        if (secondArgument !== undefined) {
            channel = this.getChannelId(message, secondArgument);
            if (channel === null) {
                channel = 'all';
                args.unshift(secondArgument);
            }
        }

        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let dbChannel = guild.get(`modules.${channel}`, {});
            if (!dbChannel.hasOwnProperty(module)) {
                dbChannel[module] = true;
            }

            let status = !dbChannel[module];
            if (guild.data.modules === null) {
                guild.data.modules = {};
            }

            dbChannel[module] = this.getStatus(args, status);
            guild.data.modules[channel] = dbChannel;

            if (channel === 'all' && !status) {
                for (let index in guild.data.modules) {
                    if (index === 'all') {
                        continue;
                    }

                    if (guild.data.modules[index].hasOwnProperty(module)) {
                        delete guild.data.modules[index][module];
                    }
                }
            }

            app.database.update(app.constants.GUILD_TABLE_NAME, {
                modules: JSON.stringify(guild.data.modules)
            }, query => query.where('id', app.getGuildIdFrom(message)));

            if (channel !== 'all') {
                return app.envoyer.sendSuccess(message, 'commands.administration.togglemodule.channel.' + (dbChannel[module] ? 'enabled' : 'disabled'), {
                    channel: `<#${channel}>`, module
                });
            }
            return app.envoyer.sendSuccess(message, 'commands.administration.togglemodule.global.' + (dbChannel[module] ? 'enabled' : 'disabled'), {
                module
            });
        });
    }

    /**
     * Gets the full module name that matches the given module.
     *
     * @param  {String}  module  The module that should be fetched.
     * @return {String|null}
     */
    getModule(module) {
        for (let i in this.categoryNames) {
            if (_.startsWith(this.categoryNames[i], module.toLowerCase())) {
                return this.categoryNames[i];
            }
        }
        return null;
    }

    /**
     * Gets the channel ID from the given message.
     *
     * @param  {IMessage} message        The Discordie message object that triggered the command.
     * @param  {String}   channelString  The channel argument given to the command.
     * @return {String|null}
     */
    getChannelId(message, channelString) {
        if (!_.startsWith(channelString, '<#')) {
            return channelString.toLowerCase() === 'all' ? 'all' : null;
        }

        let id = channelString.substr(2, channelString.length - 3);
        let channels = message.guild.channels;
        for (let i in channels) {
            let channel = channels[i];
            if (channel.type === 0 && channel.id === id) {
                return id;
            }
        }
        return null;
    }

    /**
     * Gets the status from the given arguments if one is
     * given, otherwise returne the fallback status.
     *
     * @param  {Array}    args    The list of arguments given to the command.
     * @param  {Boolean}  status  The fallback status.
     * @return {Boolean}
     */
    getStatus(args, status) {
        if (args.length < 1) {
            return status;
        }

        let stringStatus = args[0].toLowerCase();
        return stringStatus === 'on' ? true : stringStatus === 'off' ? false : status;
    }
}

module.exports = ToggleModuleCommand;
