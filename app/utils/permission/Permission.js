class Permission {

    /**
     * Checks if user who triggered the gateway socket has the given permission.
     *
     * @param  {GatewaySocket} socket      The Discordie gateway socket
     * @param  {String}        permission  The permission node that should be checked
     * @return {Boolean}
     */
    requestHas(request, permission) {
        return this.has(request.message.author, request.message.guild, permission) &&
               this.has(request.message.author, request.message.channel, permission);
    }

    /**
     * Check if the bot has the given permission.
     *
     * @param  {IMessage}  message     The Discordie message object that triggered the command.
     * @param  {String}    permission  The permission node that should be checked.
     * @return {Boolean }
     */
    botHas(message, permission) {
        return this.has(bot.User, message.guild, permission) &&
               this.has(bot.User, message.channel, permission);
    }

    /**
     * Check if the user has the given permission.
     *
     * @param  {IMessage}  message     The Discordie message object that triggered the command.
     * @param  {String}    permission  The permission node that should be checked.
     * @return {Boolean }
     */
    userHas(message, permission) {
        return this.has(message.member, message.guild, permission) &&
               this.has(message.member, message.channel, permission);
    }

    /**
     * Checks if the user has the given permission in the given context.
     *
     * @param  {IUser}            user        The Discordie user object.
     * @param  {IGuild|IChannel}  context     The Discordie context object.
     * @param  {String}           permission  The permission node that should be checked.
     * @return {Boolean}
     */
    has(user, context, permission) {
        if (!this.isValidPermission(permission)) {
            return false;
        }

        let permissionNode = this.preparePermission(permission);
        let contextPermissions = user.permissionsFor(context);

        return contextPermissions[permissionNode.group][permissionNode.perms];
    }

    /**
     * Checks if the given permission is a valid permission.
     *
     * @param  {String}  permission  The permission node that should be checked.
     * @return {Boolean}
     */
    isValidPermission(permission) {
        if (!app.bot.permissions.hasOwnProperty(permission)) {
            return false;
        }

        return app.bot.permissions[permission].length === 2;
    }

    /**
     * Prepares the permission to be used.
     *
     * @param  {String}  permission  The permission that should be prepared for use.
     * @return {Object}
     */
    preparePermission(permission) {
        let parts = app.bot.permissions[permission];

        let group = parts[0];
        let perms = parts[1];

        return {group, perms};
    }
}

module.exports = new Permission;
