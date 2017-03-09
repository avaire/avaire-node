/** @ignore */
const Middleware = require('./Middleware');

/**
 * Makes sure both the bot and the user that executed the command 
 * for the middleware has the provided list of permissions.
 * 
 * @extends {Middleware}
 */
class Require extends Middleware {
    
    /**
     * Handles the incomming command request
     * 
     * @override
     * @param  {GatewaySocket} request      Discordie message create socket
     * @param  {Closure}       next         The next request in the stack
     * @param  {Array}         permissions  List of permissions that should be checked
     * @return {mixed} 
     */
    handle(request, next, ...permissions) {
        if (request.message.isPrivate) {
            return next(request);
        }

        let payload = {
            userGuild: request.message.author.permissionsFor(request.message.guild),
            userChannel: request.message.author.permissionsFor(request.message.channel),
            botGuild: bot.User.permissionsFor(request.message.guild),
            botChannel: bot.User.permissionsFor(request.message.channel)
        };

        for (let i in permissions) {
            let permission = permissions[i];
            let permissionState = this.hasPermission(payload, permission);

            if (permissionState == 1) {
                continue;
            }

            return this.cancelMiddleware(request, permission, permissionState);
        }

        return next(request);
    }

    /**
     * Checks if both the bot and the user has the provided permission node.
     *
     * @param  {IPermissions}  userGuild    The users guild permissions
     * @param  {IPermissions}  userChannel  The users channel permissions
     * @param  {IPermissions}  botGuild     The bots guild permissions
     * @param  {IPermissions}  botChannel   The bots channel permissions
     * @param  {String}        permission   The permission node that should be checked
     * @return {Boolean|Integer}
     */
    hasPermission({userGuild, userChannel, botGuild, botChannel}, permission) {
        if (! app.bot.permissions.hasOwnProperty(permission)) {
            return false;
        }

        let permissionParts = app.bot.permissions[permission];
        if (permissionParts.length != 2) {
            return false;
        }

        let group = permissionParts[0];
        let perms = permissionParts[1];

        if (! botGuild[group][perms] || ! botChannel[group][perms]) {
            return -1;
        }

        return userGuild[group][perms] || userChannel[group][perms] ? 1 : 0;
    }

    /**
     * Cancels the middleware with the propper response messages.
     *
     * @param  {GatewaySocket} request          Discordie message create socket
     * @param  {String}        permission       The permission node that was checked
     * @param  {Integer}       permissionState  The permission state for the bot and user
     * @return {undefined}
     */
    cancelMiddleware(request, permission, permissionState) {
        let author = request.message.author;
        let message = "You're missing the required permission node for this command:";

        if (permissionState === -1) {
            message = "I don't have the required permission node to execute this command:";
        }

        request.message.channel.sendMessage(`:warning: ${message} ${permission}`);
    }
}

module.exports = Require;
