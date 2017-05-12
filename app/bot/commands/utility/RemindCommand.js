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

        this.formats = {
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

        let {timeArr, seconds} = this.parseStringifiedTimeFormat(args[0]);
        if (timeArr.length === 0) {
            return app.envoyer.sendInfo(message, 'Invalid format given!');
        }

        delete args[0];

        let hash = crypto.createHash('md5').update(message.author.id + Math.random()).digest('hex');
        this.reminderes[hash] = {
            message: args.join(' '),
            user: message.author.id
        };

        this.startReminderSchedule(hash, seconds);
        return app.envoyer.sendInfo(message, ':ok_hand: I will DM you in :time with the following message:\n\n```:message```', {
            time: this.formatedTimeMessage(timeArr),
            message: this.reminderes[hash].message
        });
    }

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
            });
        }, seconds * 1000);
    }

    parseStringifiedTimeFormat(string) {
        let seconds = 0;
        let timeArr = [];
        let parts = string.toLowerCase().match(/([0-9]+[h|m|s])/gi);

        for (let i in parts) {
            let timeString = parts[i];
            let identifier = timeString.substr(-1);
            let number = parseInt(timeString.substr(0, timeString.length - 1), 10);

            seconds += this.formats[identifier].parse(number);
            timeArr.push(`${number} ${this.formats[identifier].name}` + (number === 1 ? '' : 's'));
        }

        return {
            timeArr, seconds
        };
    }

    formatedTimeMessage(timeArr) {
        let lastTime = timeArr.pop();

        if (timeArr.length === 0) {
            return lastTime;
        } else if (timeArr.length === 1) {
            return timeArr[0] + ' and ' + lastTime;
        }

        return timeArr.join(', ') + ', and ' + lastTime;
    }
}

module.exports = RemindCommand;
