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
};

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
};

/**
 * Checks to see if the string contains a taged version of the bot.
 *
 * @return {Boolean}
 */
String.prototype.hasBot = function () {
    return _.includes(this.valueOf(), `<@${bot.User.id}>`) || _.includes(this.valueOf(), `<@!${bot.User.id}>`);
};

/**
 * Replaces the bots taged name with the given replacement.
 *
 * @param  {String} replacement  The string to replace the bots taged name with.
 * @return {String}
 */
String.prototype.replaceBotWith = function (replacement = '') {
    return _.replace(_.replace(this.valueOf(), `<@!${bot.User.id}>`, replacement), `<@${bot.User.id}>`, replacement);
};

/**
 * Makes the first letter in the string uppercase.
 *
 * @return {String}
 */
String.prototype.firstToUpper = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Converts any special character to UTF8 encoded bits that can be easily stored
 * in the database, data has to be decoded again to be shown correctly.
 *
 * @return {String}
 */
String.prototype.toDatabaseFormat = function () {
    let highSurrogate = 0;
    let string = '';

    for (let i = 0; i < this.length; i++) {
        let cc = this.charCodeAt(i);
        if (cc < 0 || cc > 0xFFFF) {
            continue;
        }

        if (highSurrogate !== 0) {
            if (cc >= 0xDC00 && cc <= 0xDFFF) {
                let suppCP = 0x10000 + ((highSurrogate - 0xD800) << 10) + (cc - 0xDC00);
                string += convertToHex(0xF0 | ((suppCP >> 18) & 0x07)) +
                          convertToHex(0x80 | ((suppCP >> 12) & 0x3F)) +
                          convertToHex(0x80 | ((suppCP >> 6) & 0x3F)) +
                          convertToHex(0x80 | (suppCP & 0x3F));
                highSurrogate = 0;
                continue;
            }

            highSurrogate = 0;
            continue;
        }

        if (cc >= 0xD800 && cc <= 0xDBFF) { // High surrogate
            highSurrogate = cc;
            continue;
        }

        if (cc <= 0x7F) {
            string += this.charAt(i);
        } else if (cc <= 0x7FF) {
            string += convertToHex(0xC0 | ((cc >> 6) & 0x1F)) + convertToHex(0x80 | (cc & 0x3F));
        } else if (cc <= 0xFFFF) {
            string += convertToHex(0xE0 | ((cc >> 12) & 0x0F)) + convertToHex(0x80 | ((cc >> 6) & 0x3F)) + convertToHex(0x80 | (cc & 0x3F));
        }
    }
    return string.trim();
};

/**
 * Converts the given character to hex(base 16)
 *
 * @param  {String}  character  The character to convert.
 * @return {String}
 */
function convertToHex(character) {
    let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    return '\\u' + hex[(character >> 4) & 0xF] + hex[character & 0xF];
}

