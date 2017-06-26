/** @ignore */
const Command = require('./../Command');

class FeedbackCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('feedback', [], {
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        app.database.insert(app.constants.FEEDBACK_TABLE_NAME, {
            message: args.join(' '),
            user: this.buildJsonUser(message),
            guild: this.buildJsonGuild(message),
            channel: this.buildJsonChannel(message)
        }).then(() => app.envoyer.sendSuccess(message, 'Successfully sent feedback <:tickYes:319985232306765825>'))
        .catch(err => {
            app.logger.error('Failed to send feedback: ', err);

            return app.envoyer.sendError(message, 'An error occurred while attempting to send your feedback:\n**Error:** ' + err.message);
        });
    }

    /**
     * Builds the user json object that should be stored in the database.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {String}
     */
    buildJsonUser(message) {
        return JSON.stringify({
            id: message.author.id,
            username: message.author.username,
            discriminator: message.author.discriminator,
            avatar: message.author.avatar
        });
    }

    /**
     * Builds the channel json object that should be stored in the database.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {String}
     */
    buildJsonChannel(message) {
        let channel = {
            id: message.channel.id,
            name: message.channel.name
        };

        if (message.channel.constructor.name === 'IDirectMessageChannel') {
            channel.name = `Direct Message with ${message.author.username}`;
        }
        return JSON.stringify(channel);
    }

    /**
     * Builds the guild json object that should be stored in the database,
     * if the message was sent in a DM the method will return null.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {String|null}
     */
    buildJsonGuild(message) {
        if (message.isPrivate) {
            return null;
        }

        return JSON.stringify({
            id: message.guild.id,
            name: message.guild.name,
            owner_id: message.guild.owner_id,
            icon: message.guild.icon
        });
    }
}

module.exports = FeedbackCommand;
