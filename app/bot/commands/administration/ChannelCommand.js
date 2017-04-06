/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class ChannelCommand extends Command {
    constructor() {
        super('.', 'channel', ['chl'], {
            allowDM: false,
            description: 'Shows what modules are enabled and disabled for the current channel, as-well as what settings they have.',
            middleware: [
                'throttle.user:2,5'
            ]
        });

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

    onCommand(sender, message, args) {
        return app.database.getGuild(message.guild.id).then(transformer => {
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
