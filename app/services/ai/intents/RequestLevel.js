/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Request cat intent handler, this is used when the someone requests
 * a cat image, all it does is run the >randomcat command for you.
 *
 * @extends {IntentHandler}
 */
class RequestCat extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        let guild = app.cache.get(`database.${app.getGuildIdFrom(this.getMessage())}`, null, 'memory');
        if (guild === null || guild.get('levels', 0) === 0) {
            return app.envoyer.sendWarn(this.getMessage(), 'This server doesn\'t have the `Levels & Experience` feature enabled so I can\'t tell you what level you are :(');
        }

        let author = this.getMessage().author;
        return this.loadProperties(this.getMessage(), author).then(({total, score, user}) => {
            let experience = user.get('experience', 0);
            let level = app.bot.features.level.getLevelFromXp(experience);
            let currn = app.bot.features.level.getLevelXp(level);

            let diff = app.bot.features.level.getLevelXp(level + 1) - currn;
            let p = (experience - currn) / diff * 100;

            let levelBar = '';
            for (let i = 1; i <= 40; i++) {
                levelBar += ((i * 2.5) < p) ? '▒' : '░';
            }

            return app.envoyer.sendEmbededMessage(this.getMessage(), {
                color: 0xE91E63,
                author: {
                    name: author.username,
                    icon_url: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=256`
                },
                footer: {
                    text: `https://avairebot.com/leaderboard/${app.getGuildIdFrom(this.getMessage())}`
                },
                fields: [
                    {
                        name: 'Rank',
                        value: score === 'Unranked' ? score : `${score} / ${this.getMessage().guild.member_count}`,
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
    loadProperties(message, author) {
        return new Promise((resolve, reject) => {
            app.bot.statistics.databaseQueries++;
            return app.database.getUser(app.getGuildIdFrom(message), author).then(user => {
                return this.getScore(message, author.id).then(score => {
                    app.bot.statistics.databaseQueries++;
                    return app.database.getClient().table(app.constants.USER_EXPERIENCE_TABLE_NAME)
                              .select(
                                  app.database.getClient().raw('sum(`experience`) - (count(`user_id`) * 100) as `total`')
                              ).where('user_id', author.id).then(totalObject => {
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
            let score = 'Unranked';

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

module.exports = RequestCat;
