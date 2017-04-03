class Module {
    toggle(message, module, moduleName) {
        return app.database.getGuild(message.guild.id).then(transformer => {
            let channel = transformer.getChannel(message.channel.id);
            let state = !channel.get(module + '.enabled', false);

            transformer.data.channels[message.channel.id] = channel.all();
            transformer.data.channels[message.channel.id][module].enabled = state;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                channels: JSON.stringify(transformer.data.channels)
            }, query => query.where('id', message.guild.id)).then(() => {
                state = state ? 'enabled' : 'disabled';

                return app.envoyer.sendSuccess(message, `commands.administration.modules.${state}`, {
                    module: moduleName,
                    channelid: message.channel.id,
                    channelname: message.channel.name
                });
            });
        }).catch(err => app.logger.error(err));
    }
}

module.exports = new Module;
