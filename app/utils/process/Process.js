
/**
 * Process class, allows for getting usfull information
 * about the application process with ease.
 */
class Process {

    /**
     * Gets the process uptime of the bot.
     *
     * @param  {Boolean}  useShorthand  Determines if we use shorthand names for the times.
     * @return {String}
     */
    getUptime(useShorthand = true) {
        let seconds = (new Date().getTime() - app.runTime) / 1000;

        let d = Math.floor(seconds / 86400);
        let h = Math.floor((seconds % 86400) / 3600);
        let m = Math.floor(((seconds % 86400) % 3600) / 60);
        let s = Math.floor(((seconds % 86400) % 3600) % 60);

        if (d > 0) {
            if (useShorthand) {
                return `${d}d ${h}h ${m}m ${s}s`;
            }
            return `${this.prepareUptimeFormat(d, 'day')}, ${this.prepareUptimeFormat(h, 'hour')}, ${this.prepareUptimeFormat(m, 'minute')}, and ${this.prepareUptimeFormat(s, 'second')}`;
        }

        if (h > 0) {
            if (useShorthand) {
                return `${h}h ${m}m ${s}s`;
            }
            return `${this.prepareUptimeFormat(h, 'hour')}, ${this.prepareUptimeFormat(m, 'minute')}, and ${this.prepareUptimeFormat(s, 'second')}`;
        }

        if (m > 0) {
            if (useShorthand) {
                return `${m}m ${s}s`;
            }
            return `${this.prepareUptimeFormat(m, 'minute')}, and ${this.prepareUptimeFormat(s, 'second')}`;
        }

        if (useShorthand) {
            return `${s}s`;
        }
        return this.prepareUptimeFormat(s, 'second');
    }

    /**
     * Prepares and formats the uptime message.
     *
     * @param  {Number}  number  The number of days, hours minutes, or seconds.
     * @param  {String}  name    The word that the defines the singular number.
     * @return {String}
     */
    prepareUptimeFormat(number, name) {
        return `${number} ${name}` + (number === 1 ? '' : 's');
    }

    /**
     * Gets the system memory usage for the application.
     *
     * @return {String}
     */
    getSystemMemoryUsage() {
        let memoryInBytes = process.memoryUsage().heapTotal - process.memoryUsage().heapUsed;
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        let k = 1000;
        let i = Math.floor(Math.log(memoryInBytes) / Math.log(k));

        return parseFloat((memoryInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new Process;
