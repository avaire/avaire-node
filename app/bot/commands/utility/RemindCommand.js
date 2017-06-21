/** @ignore */
const crypto = require('crypto');
/** @ignore */
const Command = require('./../Command');

class RemindCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('remind', ['rem'], {
            description: 'Set a message you would like to be reminded of later.',
            middleware: [
                'throttle.user:2,5'
            ]
        });

        /**
         * The reminders object.
         *
         * @type {Object}
         */
        this.reminderes = {};
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
        if (args.length < 2) {
            return this.sendMissingArguments(message);
        }

        let time = app.time.parse(args[0]);
        if (time.timeArr.length === 0) {
            return app.envoyer.sendWarn(message, 'Invalid format given!');
        }

        delete args[0];

        let hash = crypto.createHash('md5').update(message.author.id + Math.random()).digest('hex');
        this.reminderes[hash] = {
            message: args.join(' '),
            user: message.author.id
        };

        this.startReminderSchedule(hash, time.seconds);
        return app.envoyer.sendInfo(message, ':ok_hand: I will DM you in :time with the following message:\n\n```:message```', {
            time: time.format,
            message: this.reminderes[hash].message
        });
    }

    /**
     * Starts the reminder schedule task.
     *
     * @param  {String}  hash     The hash ID for the given reminder schedule task.
     * @param  {Number}  seconds  The amount of seconds before the reminder exppires.
     * @return {Task}
     */
    startReminderSchedule(hash, seconds) {
        return app.scheduler.scheduleDelayedTask(() => {
            if (!this.reminderes.hasOwnProperty(hash)) {
                return;
            }

            let user = bot.Users.get(this.reminderes[hash].user);
            if (user === null) {
                return;
            }

            return user.openDM().then(m => {
                return app.envoyer.sendInfo(m, this.reminderes[hash].message);
            }).then(() => delete this.reminderes[hash])
             .catch(() => delete this.reminderes[hash]);
        }, seconds * 1000);
    }
}

module.exports = RemindCommand;
