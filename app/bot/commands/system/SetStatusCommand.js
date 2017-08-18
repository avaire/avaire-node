/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

class SetStatusCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('setstatus', ['status'], {
            middleware: [
                'isBotAdmin'
            ]
        });

        /**
         * The cache token that should be used to store and
         * check if a custom bot status has been set.
         *
         * @type {String}
         */
        this.cacheToken = 'custom.bot-status';
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
            app.cache.forget(this.cacheToken, 'memory');

            return app.envoyer.sendSuccess(message, 'The bot status cycle has been re-enabled, the change game job can now change the bot status again.');
        }

        let status = {
            type: 0,
            name: args.join(' ')
        };

        if (status.name.indexOf('twitch.tv') > -1) {
            let parts = status.name.split('/');
            let twitchUser = parts[parts.length - 1];

            status = {
                type: 1,
                name: `Broadcasting ${twitchUser} on Twitch.TV`,
                url: status.name
            };
        }

        bot.User.setStatus(null, status);
        app.cache.forever(this.cacheToken, status, 'memory');

        return app.envoyer.sendSuccess(message, 'The bot status will now displays `:status`', {
            status: _.isObjectLike(status) ? status.name : status
        });
    }
}

module.exports = SetStatusCommand;
