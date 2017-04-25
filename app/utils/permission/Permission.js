class Permission {

    /**
     * Checks if user who triggered the gateway socket has the given permission.
     *
     * @param  {GatewaySocket} socket      The Discordie gateway socket
     * @param  {String}        permission  The permission node that should be checked
     * @return {Boolean}
     */
    requestHas(request, permission) {
        if (!this.isValidPermission(permission)) {
            return false;
        }

        let p = this.preparePermission(permission);

        let userGuild = request.message.author.permissionsFor(request.message.guild);
        let userChannel = request.message.author.permissionsFor(request.message.channel);

        return userGuild[p.group][p.perms] || userChannel[p.group][p.perms];
    }

    /**
     * Check if the bot has the given permission.
     *
     * @param  {IMessage}  message     The Discordie message object that triggered the command.
     * @param  {String}    permission  The permission node that should be checked.
     * @return {Boolean }
     */
    botHas(message, permission) {
        if (!this.isValidPermission(permission)) {
            return false;
        }

        let p = this.preparePermission(permission);

        let guild = bot.User.permissionsFor(message.guild);
        let channel = bot.User.permissionsFor(message.channel);

        return guild[p.group][p.perms] || channel[p.group][p.perms];
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
