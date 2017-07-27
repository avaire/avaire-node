/** @ignore */
const Command = require('./../Command');

/**
 * List Claimable Role Command, lists all the
 * roles that are currently claimable.
 *
 * @extends {Command}
 */
class ListClaimableRoleCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('listclaimablerole', ['lcr'], {
            allowDM: false,
            middleware: [
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
            let claimableRoles = guild.get('claimable_roles', {});
            let rolesLength = Object.keys(claimableRoles).length;
            let roles = Object.keys(claimableRoles).map(k => claimableRoles[k]);

            if (rolesLength === 0) {
                return app.envoyer.sendWarn(message, 'There are currently no claimable roles for this server.');
            }

            roles.sort();

            let pageNumber = 1;
            if (args.length > 0) {
                pageNumber = parseInt(args[0], 10);
            }

            if (isNaN(pageNumber) || pageNumber < 1) {
                pageNumber = 1;
            }

            let pages = Math.ceil(roles.length / 10);
            if (pageNumber > pages) {
                pageNumber = pages;
            }

            let rolesMessage = [];
            let start = 10 * (pageNumber - 1);
            for (let i = start; i < start + 10; i++) {
                if (roles.length <= i) {
                    break;
                }

                rolesMessage.push(`**${roles[i]}**`);
            }

            return app.envoyer.sendEmbededMessage(message, {
                title: `There are ${rolesLength} claimable roles`,
                description: rolesMessage.join('\n') + '\n\nPage **:page** out of **:pages** pages.\n`:command [page number]`',
                color: app.envoyer.colors.success
            }, {
                command: this.getCommandTrigger(message, 1),
                page: pageNumber, pages
            });
        });
    }
}

module.exports = ListClaimableRoleCommand;
