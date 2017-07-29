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
class AutoAssignRoleCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('autorole', ['aar'], {
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
        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            if (args.length === 0) {
                return this.sendCurrentAutoRole(message, guild);
            }

            if (args[0].toLowerCase() === 'disable') {
                return this.disableAutoRole(message, guild);
            }

            let role = Module.getRole(message.guild, args.join(' '));
            if (role === null) {
                return app.envoyer.sendWarn(message, '<@:userid> Invalid role, I couldn\'t find any role called **:role**', {
                    role: args.join(' ')
                });
            }

            if (!Module.isRoleValid(message.guild, role)) {
                return app.envoyer.sendWarn(message, '<@:userid> The **:role** role is positioned higher in the hierarchy, I can\'t give/remove this role from users.', {
                    role: role.name
                });
            }

            if (!Module.isRolePositionLower(message.member.roles, role)) {
                return app.envoyer.sendWarn(message, '<@:userid> The **:role** role is positioned higher in the hierarchy than any role you have, you can\'t add roles with a higher ranking than you have.', {
                    role: role.name
                });
            }

            guild.data.autorole = role.id;

            return app.database.update(app.constants.GUILD_TABLE_NAME, {
                autorole: role.id
            }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
                return app.envoyer.sendSuccess(message, '<@:userid> **Auto assign role** on user join has been **enabled** and set to  **:role**', {
                    role: role.name
                });
            });
        });
    }

    /**
     * Disables the autorole for the current server.
     *
     * @param  {IMessage}  message  The Discordie user object that ran the command.
     * @param  {IGuild}    guild    The Discordie guild object for the given command.
     * @return {Promise}
     */
    disableAutoRole(message, guild) {
        return app.database.update(app.constants.GUILD_TABLE_NAME, {
            autorole: null
        }, query => query.where('id', app.getGuildIdFrom(message))).then(() => {
            return app.envoyer.sendSuccess(message, '<@:userid> **Auto assign role** on user join is now **disabled**.');
        });
    }

    /**
     * Sends the current role status for the server.
     *
     * @param  {IMessage}  message  The Discordie user object that ran the command.
     * @param  {IGuild}    guild    The Discordie guild object for the given command.
     * @return {Promise}
     */
    sendCurrentAutoRole(message, guild) {
        let autorole = guild.get('autorole', null);
        if (autorole === null) {
            return app.envoyer.sendWarn(message, '<@:userid> **Auto assign role** on user join is currently **disabled**.');
        }

        let role = message.guild.roles.find(r => r.id === autorole);
        if (role === null || role === undefined) {
            app.database.update(app.constants.GUILD_TABLE_NAME, {
                autorole: null
            }, query => query.where('id', app.getGuildIdFrom(message)));

            return app.envoyer.sendWarn(message, '<@:userid> **Auto assign role** on user join is currently **disabled**.');
        }

        return app.envoyer.sendInfo(message, '<@:userid> The **auto assign role** is currently set to **:role**', {
            role: role.name
        });
    }
}

module.exports = AutoAssignRoleCommand;
