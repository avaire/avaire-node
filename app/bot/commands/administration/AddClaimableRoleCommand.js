/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/RoleModule');

/**
 * Add Claimable Role Command, allows server admins to add roles to a list,
 * users can then claim any role from the list, giving the user the role.
 *
 * @extends {Command}
 */
class AddClaimableRoleCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('addclaimablerole', ['acr'], {
            allowDM: false,
            middleware: [
                'require.user:general.administrator',
                'throttle.guild:1,5'
            ]
        });
    }

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        let role = Module.getRole(message.guild, args.join(' '));
        if (role === null) {
            return app.envoyer.sendWarn(message, 'Invalid role, I couldn\'t find any role called **:role**', {
                role: args.join(' ')
            });
        }

        if (!Module.isRoleValid(message.guild, role)) {
            return app.envoyer.sendWarn(message, 'The role is positioned higher in the hierarchy, I can\'t give/remove this role from users.');
        }

        if (!Module.isRolePositionLower(message.member.roles, role)) {
            return app.envoyer.sendWarn(message, 'The **:role** role is positioned higher in the hierarchy than any role you have, you can\'t add roles with a higher ranking than you have.', {
                role: role.name
            });
        }

        let roleName = app.database.stringifyEmojis(role.name);
        if (roleName === null) {
            return app.envoyer.sendError(message, 'Invalid role name given, roles only consisting of emojis can not be auto-claimable.');
        }

        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let claimableRoles = guild.get('claimable_roles', {});
            claimableRoles[role.id] = roleName.toDatabaseFormat();
            guild.data.claimable_roles = claimableRoles;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                claimable_roles: JSON.stringify(claimableRoles)
            }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
                return app.envoyer.sendSuccess(message, 'Role **:role** has been added to the list.', {
                    role: role.name
                });
            });
        });
    }
}

module.exports = AddClaimableRoleCommand;
