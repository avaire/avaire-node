
/**
 * Time parser, helps with parsing time strings
 * to formatting them nicely for the user.
 */
class TimeParser {

    /**
     * Prepares the time formats and their handlers.
     */
    constructor() {
        /**
         * The supported time formats in the short-form to long-form conversion rates.
         * @type {Object}
         */
        this.formats = {
            d: {
                name: 'day',
                parse: n => n * 60 * 60 * 24
            },
            h: {
                name: 'hour',
                parse: n => n * 60 * 60
            },
            m: {
                name: 'minute',
                parse: n => n * 60
            },
            s: {
                name: 'second',
                parse: n => n
            }
        };
    }

    /**
     * Parsed the given string, converting it to seconds,
     * formats the seconds and returns the result.
     *
     * @param  {String} string  The string that should be parsed
     * @return {Object}
     */
    parse(string) {
        let seconds = 0;
        let timeArr = [];
        let parts = string.toLowerCase().match(/([0-9]+[d|h|m|s])/gi);

        for (let i in parts) {
            let timeString = parts[i];
            let identifier = timeString.substr(-1);
            let number = parseInt(timeString.substr(0, timeString.length - 1), 10);

            seconds += this.formats[identifier].parse(number);
            timeArr.push(`${number} ${this.formats[identifier].name}` + (number === 1 ? '' : 's'));
        }

        let formatProperties = [];
        timeArr.forEach(property => {
            formatProperties.push(property);
        });

        return {
            format: this.formatTime(formatProperties),
            timeArr, seconds
        };
    }

    /**
     * Formats the time array properties.
     *
     * @param  {Array}  properties  The properties that should be formatted.
     * @return {String|null}
     */
    formatTime(properties) {
        if (properties.length === 0) {
            return null;
        }

        let lastTime = properties.pop();
        if (properties.length === 0) {
            return lastTime;
        } else if (properties.length === 1) {
            return properties[0] + ' and ' + lastTime;
        }

        return properties.join(', ') + ', and ' + lastTime;
    }
}

module.exports = new TimeParser;
