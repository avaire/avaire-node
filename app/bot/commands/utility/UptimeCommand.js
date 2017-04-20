/** @ignore */
const Command = require('./../Command');

class UptimeCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('!', 'uptime', [], {
            description: 'Tells you how long the bot has been online for.',
            middleware: [
                'throttle.user:1,2'
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
