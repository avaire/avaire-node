class Module {
    toggle(message, module, moduleName) {
        return this.getChannel(message).then(({guild, channel}) => {
            let state = !channel.get(module + '.enabled', false);

            guild.data.channels[message.channel.id][module].enabled = state;

            if (!state && !channel.defaults()[module].enabled) {
                guild.data.channels[message.channel.id][module] = channel.defaults()[module];
            }

            return this.updateChannel(message, guild).then(() => {
                state = state ? 'enabled' : 'disabled';

                return app.envoyer.sendSuccess(message, `commands.administration.modules.${state}`, {
                    module: moduleName,
                    channelid: message.channel.id,
                    channelname: message.channel.name
                });
            });
        }).catch(err => app.logger.error(err));
    }

    setProperty(message, module, properties, values) {
        if (properties.length !== values.length) {
            return Promise.reject(new Error('The properties and values arrays must have an equal number of items!'));
        }

        return new Promise((resolve, reject) => {
            return this.getChannel(message).then(({guild, channel}) => {
                if (!channel.data[module].enabled) {
                    return reject(new Error('disabled'));
                }

                for (let i in properties) {
                    if (!channel.data[module].hasOwnProperty(properties[i])) {
                        continue;
                    }

                    channel.data[module][properties[i]] = values[i];
                }

                guild.data.channels[message.channel.id] = channel.all();

                return resolve(this.updateChannel(message, guild));
            }).catch(err => app.logger.error(err));
        });
    }

    getChannel(message) {
        return new Promise((resolve, reject) => {
            return app.database.getGuild(message.guild.id).then(transformer => {
                let channel = transformer.getChannel(message.channel.id);

                transformer.data.channels[message.channel.id] = channel.all();

                return resolve({guild: transformer, channel});
            }).catch(err => reject(err));
        });
    }

    updateChannel(message, guild) {
        return app.database.update(app.constants.GUILD_TABLE_NAME, {
            channels: JSON.stringify(guild.data.channels)
        }, query => query.where('id', message.guild.id));
    }
}

module.exports = new Module;
