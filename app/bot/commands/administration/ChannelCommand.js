/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

/**
 * Channel Command, displays module statues
 * and their settings for the given channel.
 *
 * @extends {Command}
 */
class ChannelCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('channel', ['chl'], {
            allowDM: false,
            middleware: [
                'require.user:general.manage_server',
                'throttle.user:2,5'
            ]
        });

        /**
         * The object channel settings.
         *
         * @type {Object}
         */
        this.channelSettings = {
            modlog: {name: 'Mod Log'},
            ai: {name: 'AI Messages'},
            slowmode: {
                name: 'Slowmode',
                format: setting => {
                    if (!setting.enabled) {
                        return 'Disabled';
                    }

                    return `__Enabled__\n${setting.messagesPerLimit} messages every ${setting.messageLimit} seconds.`;
                }
            },
            welcome: {
                name: 'Welcome Message',
                format: setting => {
                    if (!setting.enabled) {
                        return 'Disabled';
                    }

                    return '__Enabled__\n' + (setting.message === null ?
                        '*Default welcome message*\nUse `.welcomemsg <message>` to set your own welcome message' :
                        setting.message);
                }
            },
            goodbye: {
                name: 'Goodbye Message',
                format: setting => {
                    if (!setting.enabled) {
                        return 'Disabled';
                    }

                    return '__Enabled__\n' + (setting.message === null ?
                        '*Default goodbye message*\nUse `.goodbyemsg <message>` to set your own goodbye message' :
                        setting.message);
                }
            }
        };
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
        return app.database.getGuild(app.getGuildIdFrom(message)).then(transformer => {
            let channel = transformer.getChannel(message.channel.id);
            let fields = [];

            for (let setting in this.channelSettings) {
                let channelSetting = this.channelSettings[setting];
                let value = channel.get(setting).enabled ? 'Enabled' : 'Disabled';

                if (channelSetting.hasOwnProperty('format')) {
                    value = channelSetting.format(channel.get(setting));
                }

                fields.push({name: channelSetting.name, inline: true, value});
            }

            return app.envoyer.sendEmbededMessage(message, {
                title: `#${message.channel.name} (${message.channel.id})`,
                color: 0x3498DB, fields
            });
        });
    }
}

module.exports = ChannelCommand;
