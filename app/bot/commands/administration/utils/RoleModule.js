
/**
 * Role Module, used to handle anything role
 * related in the administration module.
 */
class RoleModule {

    /**
     * Gets the role from the given object.
     *
     * @param  {IGuild|IGuildMember}  obj   The Discordie obj object.
     * @param  {String}               name  The name of the role that should be fetched.
     * @return {IRole|null}
     */
    getRole(obj, name) {
        let role = obj.roles.find(r => {
            return r.name.toLowerCase() === name.toLowerCase();
        });

        return (role === undefined || role === null) ? null : role;
    }

    /**
     * Checks if the given role is lower then any of the roles given in the array.
     *
     * @param  {Array}  roles  The array of roles the given role should be lower than.
     * @param  {IRole}  role   The role that should be checked.
     * @return {Boolean}
     */
    isRolePositionLower(roles, role) {
        return roles.filter(r => {
            return r.position > role.position;
        }).length > 0;
    }

    /**
     * Checks if the role is valid, by checking if the
     * role is position lower in the role hierarchy.
     *
     * @param  {IGuild}  guild  The guild the command is being executed on.
     * @param  {IRole}   role   The role that should be checked.
     * @return {Boolean}
     */
    isRoleValid(guild, role) {
        return this.isRolePositionLower(this.getBotRolesFrom(guild), role);
    }

    /**
     * Get the bots roles from the given guild.
     *
     * @param  {IGuild}  guild  The guild the command is being executed on.
     * @return {Array}
     */
    getBotRolesFrom(guild) {
        return guild.members.find(u => {
            return u.id === bot.User.id;
        }).roles;
    }

    /**
     * Sends the given role message.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @param  {Role}      role     The role the message should be sent for.
     * @param  {String}    desc     The message that should be sent to the user.
     * @return {Promise}
     */
    sendRoleMessage(message, role, desc) {
        return app.envoyer.sendSuccess(message, desc, {
            role: role.name
        }).then(sentMessage => {
            // This auto deletes the role messages after everything is done, it might not
            // be a good idea to keep the code if there aren't any option to turn it
            // off as well, so for now the code is just commented out.
            //
            // message.delete();
            // return app.scheduler.scheduleDelayedTask(() => {
            //     sentMessage.delete();
            // }, 9500);
        });
    }
}

module.exports = new RoleModule;
