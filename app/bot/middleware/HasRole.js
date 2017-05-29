/** @ignore */
const Middleware = require('./Middleware');

/**
 * Checks if the user who invoked the command has the
 * list of roles, or if the user is a bot admin.
 *
 * @extends {Middleware}
 */
class HasRole extends Middleware {

    /**
     * Handles the incomming command request
     *
     * @override
     * @param  {GatewaySocket} request  Discordie message create socket
     * @param  {Closure}       next     The next request in the stack
     * @param  {Array}         roles    List of roles that the user should have
     * @return {mixed}
     */
    handle(request, next, ...roles) {
        if (this.isBotAdmin(request.message.author)) {
            return next(request);
        }

        if (request.message.isPrivate) {
            return next(request);
        }

        if (app.permission.has(request.message.author, request.message.guild, 'general.administrator')) {
            return next(request);
        }

        for (let i in roles) {
            let role = roles[i];

            if (!this.hasRole(request.message.member, role)) {
                return app.envoyer.sendError(request.message, 'You must have the `:role` role to do that.', {role});
            }
        }

        return next(request);
    }

    /**
     * Checks if the users id is in the "botAccess" property in the config.json file.
     *
     * @param  {IUser}    author  Discordie user object
     * @return {Boolean}          Returns ture if the user is a bot admin
     */
    isBotAdmin(author) {
        for (let index in app.config.botAccess) {
            if (author.id === app.config.botAccess[index]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if the user has the given role.
     *
     * @param  {IGuildMember}  member    The guild member object instance.
     * @param  {String}        roleName  The name of the role the user should have
     * @return {Boolean}
     */
    hasRole(member, roleName) {
        return member.roles.find(role => {
            return role.name.toLowerCase() === roleName.toLowerCase();
        }) !== undefined;
    }
}

module.exports = HasRole;
