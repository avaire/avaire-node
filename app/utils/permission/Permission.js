class Permission {

    /**
     * Checks if user who triggered the gateway socket has the given permission.
     *
     * @param  {GatewaySocket} socket      The Discordie gateway socket
     * @param  {String}        permission  The permission node that should be checked
     * @return {Boolean}
     */
    requestHas(request, permission) {
        if (!app.bot.permissions.hasOwnProperty(permission)) {
            return false;
        }

        let permissionParts = app.bot.permissions[permission];
        if (permissionParts.length !== 2) {
            return false;
        }

        let group = permissionParts[0];
        let perms = permissionParts[1];

        let userGuild = request.message.author.permissionsFor(request.message.guild);
        let userChannel = request.message.author.permissionsFor(request.message.channel);

        return userGuild[group][perms] || userChannel[group][perms];
    }
}

module.exports = new Permission;
