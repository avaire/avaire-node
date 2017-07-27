/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/RoleModule');

/**
 * Remove Claimable Role Command, allows server admins to removes roles from
 * the list, preventing users from then claiming the given role again.
 *
 * @extends {Command}
 */
class RemoveClaimableRoleCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('removeclaimablerole', ['rcr'], {
            allowDM: false,
            usage: '<role>',
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

        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let claimableRoles = guild.get('claimable_roles', {});

            if (!claimableRoles.hasOwnProperty(role.id)) {
                return app.envoyer.sendWarn(message, 'The **:role** role is not self-assigable.', {
                    role: role.name
                });
            }

            delete claimableRoles[role.id];
            guild.data.claimable_roles = claimableRoles;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                claimable_roles: JSON.stringify(claimableRoles)
            }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
                return app.envoyer.sendSuccess(message, '<@:userid> **:role** has been removed from the list of claimable roles.', {
                    role: role.name
                });
            });
        });
    }
}

module.exports = RemoveClaimableRoleCommand;
