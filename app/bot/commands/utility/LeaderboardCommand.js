/** @ignore */
const Command = require('./../Command');
/** @ignore */
const UserTransformer = require('./../../../database/transformers/UserTransformer');

class LeaderboardCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('leaderboard', ['top'], {
            allowDM: false,
            description: 'Gets your rank, leve and xp for the current server.',
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
        let guild = app.cache.get(`database.${app.getGuildIdFrom(message)}`, null, 'memory');
        if (guild === null || guild.get('levels', 0) === 0) {
            return app.envoyer.sendWarn(message, 'This command requires the `Levels & Experience` feature to be enabled for the server, you can ask a server admin if they want to enable it with `.level`');
        }

        return this.loadTop100From(message).then(users => {
            let pageNumber = 1;
            if (args.length > 0) {
                pageNumber = parseInt(args[0], 10);
            }

            if (isNaN(pageNumber) || pageNumber < 1) {
                pageNumber = 1;
            }

            let pages = Math.ceil(users.length / 10);
            if (pageNumber > pages) {
                pageNumber = pages;
            }

            let formattedUsers = [];
            let start = 10 * (pageNumber - 1);
            for (let i = start; i < start + 10; i++) {
                if (users.length <= i) {
                    break;
                }

                let user = users[i];
                let xp = user.get('experience');

                formattedUsers.push(`\`${i + 1}\` **${user.get('username')}** is level **${app.bot.features.level.getLevelFromXp(xp)}** with **${xp - 100}** xp.`);
            }

            return app.envoyer.sendEmbededMessage(message, {
                color: 0xE91E63,
                title: `${message.guild.name} Leaderboard`,
                description: formattedUsers.join('\n'),
                footer: {
                    text: `Showing page ${pageNumber} out of ${pages} pages`
                }
            });
        });
    }

    /**
     * Loads the top 100 users from cache if they exists, otherwise query
     * the database to get the top 100 users for the current server.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    loadTop100From(message) {
        let cacheToken = `database-xp-leaderbord.${app.getGuildIdFrom(message)}`;
        return new Promise((resolve, reject) => {
            if (app.cache.has(cacheToken)) {
                let users = app.cache.get(cacheToken);
                let transformedUsers = [];

                for (let i in users) {
                    transformedUsers.push(new UserTransformer(users[i]));
                }

                return resolve(transformedUsers);
            }

            app.bot.statistics.databaseQueries++;
            return app.database.getClient()
                               .table(app.constants.USER_EXPERIENCE_TABLE_NAME)
                               .where('guild_id', app.getGuildIdFrom(message))
                               .orderBy('experience', 'desc')
                               .limit(100)
                               .then(users => {
                                   let transformedUsers = [];
                                   for (let i in users) {
                                       transformedUsers.push(new UserTransformer(users[i]));
                                   }

                                   app.cache.put(cacheToken, users, 120);
                                   return resolve(transformedUsers);
                               });
        });
    }
}

module.exports = LeaderboardCommand;
