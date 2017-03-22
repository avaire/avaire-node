/** @ignore */
const _ = require('lodash');

/**
 * Limits the string to the given length.
 * 
 * @param  {Number} cutoff  The limit of the length of the string.
 * @param  {String} suffix  The suffix that should follow the string if it is too long.
 * @return {String}
 */
String.prototype.limit = function (cutoff = 100, suffix = '...') {
    if (this.length < cutoff) {
        return this.valueOf();
    }

    return this.substr(0, cutoff - suffix.length).trim() + suffix;
}

/**
 * Makes sure the string ends with the given suffix, if the string already
 * ends with the given suffix no changes will be made to the string.
 * 
 * @param  {String} suffix  The suffix that should follow the string if the string doesn't already end with the suffix.
 * @return {String}
 */
String.prototype.finish = function (suffix) {
    if (typeof suffix !== 'string') {
        return this.valueOf();
    }

    if (this.substr(-1 * suffix.length) === suffix) {
        return this.valueOf();
    }

    return this.valueOf() + suffix;
}

/**
 * Checks to see if the string contains a taged version of the bot.
 * 
 * @return {Boolean}
 */
String.prototype.hasBot = function () {
    return _.includes(this.valueOf(), `<@${bot.User.id}>`) || _.includes(this.valueOf(), `<@!${bot.User.id}>`);
}

/**
 * Replaces the bots taged name with the given replacement.
 * 
 * @param  {String} replacement  The string to replace the bots taged name with. 
 * @return {String}
 */
String.prototype.replaceBotWith = function (replacement = '') {
    return _.replace(_.replace(this.valueOf(), `<@!${bot.User.id}>`, replacement), `<@${bot.User.id}>`, replacement);
}
