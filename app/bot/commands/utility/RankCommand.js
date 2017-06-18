/** @ignore */
const Command = require('./../Command');

class RankCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('rank', ['level'], {
            allowDM: false,
            description: 'Gets your rank, leve and xp for the current server.',
            middleware: [
                'throttle.user:1,5'
            ]
        });

        this.cacheToken = 'database-user-scores.';
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

        return this.loadProperties(message).then(({total, score, user}) => {
            let experience = user.get('experience', 0);
            let level = app.bot.features.level.getLevelFromXp(experience);
            let currn = app.bot.features.level.getLevelXp(level);

            let diff = app.bot.features.level.getLevelXp(level + 1) - currn;
            let p = (experience - currn) / diff * 100;

            let levelBar = '';
            for (let i = 1; i <= 40; i++) {
                levelBar += ((i * 2.5) < p) ? '▒' : '░';
            }

            return app.envoyer.sendEmbededMessage(message, {
                color: 0xE91E63,
                author: {
                    name: message.author.username,
                    icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=256`
                },
                footer: {
                    text: `https://avairebot.com/leaderboard/${app.getGuildIdFrom(message)}`
                },
                fields: [
                    {
                        name: 'Rank',
                        value: `${score} / ${message.guild.member_count}`,
                        inline: true
                    },
                    {
                        name: 'Level',
                        value: app.bot.features.level.getLevelFromXp(user.get('experience', 0)),
                        inline: true
                    },
                    {
                        name: 'Experience',
                        value: `${experience - 100 < 0 ? 0 : experience - 100} (Total: ${total})`,
                        inline: true
                    },
                    {
                        name: 'Experience needed to next Level',
                        value: `[${levelBar}] ${p.toFixed(2)}%\n                                           You need ${diff - (experience - currn)} more XP to level up.`
                    }
                ]
            });
        });
    }

    /**
     * Load the needed properties from the database and cache.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    loadProperties(message) {
        return new Promise((resolve, reject) => {
            app.bot.statistics.databaseQueries++;
            return app.database.getUser(app.getGuildIdFrom(message), message.author).then(user => {
                return this.getScore(message, message.author.id).then(score => {
                    app.bot.statistics.databaseQueries++;
                    return app.database.getClient().table(app.constants.USER_EXPERIENCE_TABLE_NAME)
                              .select(
                                  app.database.getClient().raw('sum(`experience`) - (count(`user_id`) * 100) as `total`')
                              ).where('user_id', message.author.id).then(totalObject => {
                                  return resolve({total: totalObject[0].total, score, user});
                              });
                });
            });
        });
    }

    /**
     * Gets the users score/rank for the given server.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    userId   The ID of the user that score should be fetched from.
     * @param  {Function}  resolve  The promise resolve function.
     * @return {Promise}
     */
    getScore(message, userId, resolve = null) {
        let cacheToken = this.cacheToken + app.getGuildIdFrom(message);
        if (app.cache.has(cacheToken, 'memory')) {
            let users = app.cache.get(cacheToken, [], 'memory');
            let score = 'Unknown';

            for (let i = 0; i < users.length; i++) {
                if (users[i].user_id === userId) {
                    score = i + 1;
                    break;
                }
            }

            if (resolve !== null) {
                return resolve(score);
            }
            return Promise.resolve(score);
        }

        return new Promise((resolve, reject) => {
            app.bot.statistics.databaseQueries++;

            return app.database.getClient()
                               .table(app.constants.USER_EXPERIENCE_TABLE_NAME)
                               .select('user_id')
                               .orderBy('experience', 'desc')
                               .where('guild_id', app.getGuildIdFrom(message))
                               .then(users => {
                                   app.cache.put(cacheToken, users, 120, 'memory');

                                   return this.getScore(message, userId, resolve);
                               });
        });
    }
}

module.exports = RankCommand;
