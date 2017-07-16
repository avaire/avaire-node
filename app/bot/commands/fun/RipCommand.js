/** @ignore */
const Command = require('./../Command');

class RipCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('rip', [], {
            middleware: [
                'throttle.user:1,5'
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
        return app.database.getStatistics().then(statistics => {
            app.bot.statistics.respects++;
            statistics.data.respects++;

            app.database.update(app.constants.STATISTICS_TABLE_NAME, statistics.toDatabaseBindings());

            let user = message.author.username;
            if (!message.isPrivate && message.member !== null && message.member.nick !== null) {
                user = message.member.nick;
            }

            return app.envoyer.sendEmbededMessage(message, {
                color: 0x2A2C31,
                description: `**:user** has paid their respects.`,
                footer: {
                    text: `${app.bot.statistics.respects} Today, ${statistics.data.respects} Overall`
                }
            }, {user});
        });
    }
}

module.exports = RipCommand;
