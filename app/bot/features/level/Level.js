/** @ignore */
const Feature = require('./../Feature');

/**
 * The Level feature.
 *
 * @extends {Feature}
 */
class Level extends Feature {

    constructor() {
        super();

        /**
         * The quadratic equation `a` value.
         *
         * @type {Number}
         */
        this.a = 5;

        /**
         * The quadratic equation `b` value.
         *
         * @type {Number}
         */
        this.b = 50;

        /**
         * The quadratic equation `c` value.
         *
         * @type {Number}
         */
        this.c = 100;
    }

    /**
     * Gets the XP needed to reach the given level using the quadratic equation.
     *
     * @param  {Number}  level  The level that should be converted to xp.
     * @return {Number}
     */
    getLevelXp(level) {
        return (this.a * Math.pow(level, 2)) + (this.b * level) + this.c;
    }

    /**
     * Gets the level from the XP given using the quadratic equation,
     * solving for X with our known a, b and c variables.
     *
     * @param  {Number}  xp  The xp that should be solved, xp has to be greater than -1.
     * @return {Number}
     */
    getLevelFromXp(xp) {
        if (Math.pow(this.b, 2) - ((4 * this.a) * (this.c - xp)) < 0) {
            return new Error('discriminant is less than zero, no real roots');
        }

        // Solves X for the quadratic equation, if our XP is lower than our C value we'll end up with a negativ
        // number, to prevent sending back a negative level we'll convert any number lower than 0 to 0.
        let x = (-this.b + Math.sqrt(Math.pow(this.b, 2) - ((4 * this.a) * (this.c - xp)))) / (2 * this.a);

        return x < 0 ? 0 : Math.floor(x);
    }

    /**
     * Rewards the user xp from sending a message in the guild, the
     * user will receive a random amount of XP between 15 and 20,
     * limited to once every minute.
     *
     * @param  {IMessage}          message  The Discordie message object that triggered the event.
     * @param  {GuildTransformer}  guild    The database guild transformer for the current guild.
     * @param  {UserTransformer}   user     The database user transformer for the current guild.
     * @param  {Number}            amount   The amount of XP that should be given to the user.
     * @return {mixed}
     */
    rewardUserExperience(message, guild, user, amount) {
        let cacheToken = `user-message-xp-event.${user.get('guild_id')}.${user.get('user_id')}`;
        if (app.cache.has(cacheToken, 'memory')) {
            return;
        }

        app.cache.put(cacheToken, new Date, 60, 'memory');

        let exp = user.get('experience', 0);
        let lvl = Math.floor(this.getLevelFromXp(exp));

        exp += amount;

        user.data.experience = exp;
        return app.database.update(app.constants.USER_EXPERIENCE_TABLE_NAME,
            this.buildUserExperienceUpdateObject(message, user),
        query => query.where('user_id', message.author.id).andWhere('guild_id', app.getGuildIdFrom(message))).then(() => {
            if (guild.get('level_alerts', 0) !== 0 && this.getLevelFromXp(exp) > lvl) {
                return app.envoyer.sendInfo(message, 'GG <@:userid>, you just reached **Level :level**', {
                    level: this.getLevelFromXp(exp)
                });
            }
        });
    }

    /**
     * Builds the field update object for the SQL query, if the user has
     * changed their username, avatar or discriminator since they last
     * received XP their user data will also be updated.
     *
     * @param  {IMessage}         message  The Discordie message object that triggered the event.
     * @param  {UserTransformer}  user     The database user transformer for the current guild.
     * @return {Object}
     */
    buildUserExperienceUpdateObject(message, user) {
        let updateObject = {
            experience: user.data.experience
        };

        if (message.author.username !== user.get('username')) {
            updateObject.username = message.author.username;
        }
        if (message.author.discriminator !== user.get('discriminator')) {
            updateObject.discriminator = message.author.discriminator;
        }
        if (message.author.avatar !== user.get('avatar')) {
            updateObject.avatar = message.author.avatar;
        }

        return updateObject;
    }
}

module.exports = new Level;
