/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Module = require('./utils/RoleModule');

/**
 * I Am Not Command, allows users to unclaim roles
 * on the self-claimable roles list.
 *
 * @extends {Command}
 */
class IAmNotCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('iamnot', ['iamn'], {
            allowDM: false,
            usage: '<role>',
            middleware: [
                'throttle.user:1,4'
            ]
        });

        /**
         * The message that should be sent if the user lost the role successfully.
         *
         * @type {String}
         */
        this.message = '<@:userid> You no longer have the **:role** role!';
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

        let name = app.database.stringifyEmojis(args.join(' '));
        if (name === null) {
            return app.envoyer.sendWarn(message, 'Invalid role name given, add more info here...');
        }

        name = name.toDatabaseFormat().toLowerCase();

        return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
            let roles = guild.get('claimable_roles', []);
            let roleNames = Object.keys(roles).map(k => roles[k].toLowerCase());

            if (roleNames.indexOf(name) === -1) {
                return app.envoyer.sendWarn(message, 'Invalid role name given, the **:role** role is not claimable.', {
                    role: args.join(' ')
                });
            }

            let roleId = Object.keys(roles).find(k => roles[k].toLowerCase() === name);
            let role = message.guild.roles.find(r => r.id === roleId);
            if (role === undefined || role === null) {
                return app.envoyer.sendError(message, 'Something went wrong while fetching the role from the database, the given role ID does nost exist on this server.');
            }

            if (!message.member.hasRole(role)) {
                return Module.sendRoleMessage(message, role, this.message);
            }

            return message.member.unassignRole(role).then(() => Module.sendRoleMessage(message, role, this.message)).catch(err => {
                return app.logger.error(err);
            });
        });
    }
}

module.exports = IAmNotCommand;
