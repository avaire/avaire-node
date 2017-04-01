/** @ignore */
const Command = require('./../Command');

class ModlogCommand extends Command {
    constructor() {
        super('.', 'modlog', ['mlog'], {
            allowDM: false,
            description: 'Toggles the ModLog module on or off for the current channel.',
            middleware: [
                'require:general.manage_server',
                'throttle.guild:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        return app.database.getGuild(message.guild.id).then(transformer => {
            let channel = transformer.getChannel(message.channel.id);
            let state = !channel.get('modlog.enabled', false);

            transformer.data.channels[message.channel.id] = channel.all();
            transformer.data.channels[message.channel.id].modlog.enabled = state;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                channels: JSON.stringify(transformer.data.channels)
            }, query => query.where('id', message.guild.id)).then(() => {
                let modlogState = state ? 'enabled' : 'disabled';

                return app.envoyer.sendSuccess(message, `commands.administration.modlog.${modlogState}`, {
                    channelid: message.channel.id,
                    channelname: message.channel.name
                });
            });
        }).catch(err => app.logger.error(err));
    }
}

module.exports = ModlogCommand;
