/** @ignore */
const Command = require('./../Command');

class UptimeCommand extends Command {
    constructor() {
        super('!', 'uptime', [], {
            description: 'Tells you information about the bot itself.',
            middleware: [
                'throttle.user:1,2'
            ]
        });
    }

    onCommand(sender, message, args) {
        return app.envoyer.sendInfo(message, 'I have been up for ' + this.getProcessUptime());
    }

    getProcessUptime() {
        let seconds = process.uptime();

        let d = Math.floor(seconds / 86400);
        let h = Math.floor((seconds % 86400) / 3600);
        let m = Math.floor(((seconds % 86400) % 3600) / 60);
        let s = Math.floor(((seconds % 86400) % 3600) % 60);

        if (d > 0) {
            return `${this.prepare(d, 'day')}, ${this.prepare(h, 'hour')}, ${this.prepare(m, 'minute')}, and ${this.prepare(s, 'second')}`;
        }

        if (h > 0) {
            return `${this.prepare(h, 'hour')}, ${this.prepare(m, 'minute')}, and ${this.prepare(s, 'second')}`;
        }

        if (m > 0) {
            return `${this.prepare(m, 'minute')}, and ${this.prepare(s, 'second')}`;
        }

        return this.prepare(s, 'second');
    }

    prepare(number, name) {
        return `${number} ${name}` + (number === 1 ? '' : 's');
    }
}

module.exports = UptimeCommand;
