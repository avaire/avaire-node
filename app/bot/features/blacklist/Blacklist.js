/** @ignore */
const Feature = require('./../Feature');

/**
 * The Blacklist feature.
 *
 * @extends {Feature}
 */
class Blacklist extends Feature {

    /**
     * Sets up the Blacklist feature.
     */
    constructor() {
        super();

        /**
         * The list of user IDs that are backlisted from using the bot.
         *
         * @type {Array}
         */
        this.blacklist = [];
    }

    /**
     * Adds the given user to the blacklist.
     *
     * @param  {IUser}   user    The Discordie user instance.
     * @param  {String}  reason  The reason the user was added to the blacklist.
     * @return {Promise}
     */
    addUser(user, reason = null) {
        if (this.isBlacklisted(user.id)) {
            return Promise.reject(new Error(`User (${user.id}) is already blacklisted.`));
        }

        this.blacklist.push({
            id: '?',
            user_id: user.id,
            reason: null
        });

        return app.database.insert(app.constants.BLACKLIST_TABLE_NAME, {
            user_id: user.id, reason
        });
    }

    /**
     * Removes the given user to the blacklist.
     *
     * @param  {String}  userId  The ID of the user that should be removed.
     * @return {Promise}
     */
    removeUser(userId) {
        if (!this.isBlacklisted(userId)) {
            return Promise.reject(new Error(`User (${userId}) is not blacklisted.`));
        }

        let index = this.getBlacklistIndex(userId);
        if (index > -1) {
            delete this.blacklist[index];
        }

        return app.database.getClient().table(app.constants.BLACKLIST_TABLE_NAME).where({
            user_id: userId
        }).del();
    }

    /**
     * Checks if the given user id is on the bots blacklist.
     *
     * @param  {String}  userId  The ID of the user that should be checked.
     * @return {Boolean}
     */
    isBlacklisted(userId) {
        for (let i in this.blacklist) {
            let dbUser = this.blacklist[i];

            if (dbUser.user_id !== userId) {
                continue;
            }

            // Makes sure that if the user is on the blacklist but
            // is also a bot admin they can use the bot anyway.
            return app.config.botAccess.indexOf(userId) === -1;
        }
        return false;
    }

    /**
     * Gets the index of the blacklist that has the mcatching user id.
     *
     * @param  {String}  userId  The ID of the user that should be found.
     * @return {Number}
     */
    getBlacklistIndex(userId) {
        for (let i in this.blacklist) {
            if (this.blacklist[i].user_id === userId) {
                return i;
            }
        }
        return -1;
    }
}

module.exports = new Blacklist;
