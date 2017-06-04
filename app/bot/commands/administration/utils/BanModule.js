
/**
 * Ban Module, used to handel all ban and soft ban functionality.
 */
class BanModule {

    /**
     * Executes the ban logic.
     *
     * @param  {IUser}     sender          The Discordie user object that ran the command.
     * @param  {IMessage}  message         The Discordie message object that triggered the command.
     * @param  {Array}     args            The arguments that was parsed to the command.
     * @param  {Boolean}   deleteMessages  Determines if messages should be deleted when the user is banned or not.
     * @return {mixed}
     */
    ban(sender, message, args, deleteMessages = false) {
        if (message.mentions.length === 0) {
            return app.envoyer.sendWarn(message, 'commands.administration.ban.missing-user');
        }

        let user = this.getUser(message, args.shift());
        if (user === undefined) {
            return;
        }

        if (this.isInHigherRole(message, sender, user)) {
            return app.envoyer.sendWarn(message, 'commands.administration.ban.hierarchy');
        }

        let mockUser = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator
        };

        app.cache.put(`ban.${app.getGuildIdFrom(message)}.${user.id}`, new Date, 30, 'memory');

        user.ban(deleteMessages ? 7 : 0).then(() => {
            let reason = (args.join(' ').trim().length === 0) ? `*${app.lang.get(message, 'commands.administration.ban.no-reason')}*` : `"${args.join(' ')}"`;

            return app.bot.features.modlog.send(message, sender, mockUser, app.lang.get(message, 'commands.administration.ban.modlog-message', {reason}));
        }).catch(err => {
            app.logger.error(err);
            return app.envoyer.sendWarn(message, `commands.administration.ban.error`, {
                user: `${user.username}#${user.discriminator}`,
                error: err.message
            });
        });
    }

    /**
     * Gets the IGuildMember user instance.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    user     The id of the user.
     * @return {IGuildMember|undefined}
     */
    getUser(message, user) {
        if (message.mentions.length > 0) {
            user = message.mentions[0].id;
        }

        user = message.guild.members.find(gUser => gUser.id === user);

        if (user === undefined) {
            app.envoyer.sendWarn(message, 'commands.administration.ban.invalid-user');
            return undefined;
        }

        return user;
    }

    /**
     * Determines if the users role rank is higher than the senders.
     *
     * @param  {IMessage}      message  The Discordie message object that triggered the command.
     * @param  {IUser}         sender   The user object of the user that are banning the user.
     * @param  {IGuildMember}  user     The user that is being banned.
     * @return {Boolean}
     */
    isInHigherRole(message, sender, user) {
        let userRoleRank = this.getHigestRoleRank(user.roles);

        let senderGuildMember = message.guild.members.find(u => u.id === sender.id);
        let senderRoleRank = this.getHigestRoleRank(senderGuildMember.roles);

        return userRoleRank >= senderRoleRank;
    }

    /**
     * Gets the users role rank, the higher the better the rank is.
     *
     * @param  {Array} roles  The roles that should be checked.
     * @return {Integer}
     */
    getHigestRoleRank(roles) {
        let roleRank = 0;

        for (let i in roles) {
            let role = roles[i];

            if (role.position > roleRank) {
                roleRank = role.position;
            }
        }

        return roleRank;
    }
}

module.exports = new BanModule;
