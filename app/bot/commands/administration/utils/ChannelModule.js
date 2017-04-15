class ChannelModule {

    /**
     * Toggles the given module for the provided channel.
     *
     * @param  {IMessage}  message     The Discordie message object that triggered the module.
     * @param  {String}    module      The name of the module that should be toggeled.
     * @param  {String}    moduleName  The display name of the module that shouold be toggeled.
     * @return {Promise}
     */
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

    /**
     * Sets a property for a channel module.
     *
     * @param  {IMessage}  message     The Discordie message object that triggered the module.
     * @param  {String}    module      The name of the module that should be used.
     * @param  {Array}     properties  The array of properties that should be changed.
     * @param  {Array}     values      The array of values that should replace the properties keys.
     * @return {Promise}
     */
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

    /**
     * Get the channel transformer from the provided message.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the module.
     * @return {Promise}
     */
    getChannel(message) {
        return new Promise((resolve, reject) => {
            return app.database.getGuild(message.guild.id).then(transformer => {
                let channel = transformer.getChannel(message.channel.id);

                transformer.data.channels[message.channel.id] = channel.all();

                return resolve({guild: transformer, channel});
            }).catch(err => reject(err));
        });
    }

    /**
     * Updates the guild channel by running a SQL UPDATE query.
     *
     * @param  {IMessage}  message       The Discordie message object that triggered the module.
     * @param  {GuildTransformer} guild  The guild transformer that should be updated.
     * @return {Promise}
     */
    updateChannel(message, guild) {
        return app.database.update(app.constants.GUILD_TABLE_NAME, {
            channels: JSON.stringify(guild.data.channels)
        }, query => query.where('id', message.guild.id));
    }
}

module.exports = new ChannelModule;
