/** @ignore */
const URL = require('url');
/** @ignore */
const expander = require('expand-url');
/** @ignore */
const Command = require('./../Command');

class CreateYesNoPollCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('yesnopoll', ['ynpoll', 'poll'], {
            usage: '<time> <poll>',
            middleware: [
                'require.user:general.manage_emojis'
            ]
        });

        /**
         * The yes emoji.
         *
         * @type {Object}
         */
        this.yesEmoji = {
            id: '319985232306765825',
            name: 'tickYes'
        };

        /**
         * The no emoji.
         *
         * @type {Object}
         */
        this.noEmoji = {
            id: '319985629750624257',
            name: 'tickNo'
        };
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
        if (args.length < 1) {
            return this.sendMissingArguments(message);
        }

        let time = app.time.parse(args[0]);
        if (time.timeArr.length === 0 && time.seconds === 0) {
            return app.envoyer.sendWarn(message, [
                'Invalid time format given, the format has to look something like `25m52s` to make the poll last for 25 minutes and 52 seconds,' +
                'you can combine or exclude any combination of the number followed by a `m` for minutes or `s` for seconds',
                '\n**Format:** `:command <format> <poll message>`'
            ].join(' '), {
                command: this.getCommandTrigger(message)
            });
        } else if (time.seconds < 30) {
            return app.envoyer.sendWarn(message, 'Time given for the poll is too low, the poll time must be atleast `30 seconds` or more.');
        } else if (time.seconds > 3600) {
            return app.envoyer.sendWarn(message, 'Time given for the poll is too high, the poll can not be higher than `1 hour` or more.');
        }

        args.splice(0, 1);
        let poll = args.join(' ');

        return app.envoyer.sendEmbededMessage(message, this.buildPollEmbededMessage(poll, time.seconds, false))
                  .then(sentMessage => this.preparePoll(sentMessage)
                  .then(() => this.editRecurringPollMessages(sentMessage, poll, time.seconds))
                );
    }

    /**
     * Edits the poll message recursively until the poll exires.
     *
     * @param  {IMessage}  message   The Discordie message object that triggered the command.
     * @param  {String}    poll      The poll message.
     * @param  {[type]}    timeLeft  The amount of seconds left before the poll exires.
     * @return {Promise}
     */
    editRecurringPollMessages(message, poll, timeLeft) {
        if (timeLeft <= 0) {
            return message.edit('', this.buildPollEmbededMessage(poll, 0)).then(editedMessage => {
                return this.sendTally(editedMessage, poll);
            }).catch(err => {
                if (err.message.indexOf('Not Found') > -1 && err.message.indexOf('Unknown Message') > -1) {
                    return;
                }
                app.logger.error(err);
            });
        }

        let updateTime = 60;
        if (timeLeft > 60 && timeLeft % 60 !== 0) {
            updateTime = timeLeft % 60;
        } else if (timeLeft <= 30) {
            updateTime = 5;
        } else if (timeLeft <= 60) {
            updateTime = 30;
        }

        return message.edit('', this.buildPollEmbededMessage(poll, timeLeft)).then(editedMessage => {
            return app.scheduler.scheduleDelayedTask(() => {
                return this.editRecurringPollMessages(editedMessage, poll, timeLeft - updateTime);
            }, updateTime * 1000);
        }).catch(err => {
            if (err.message.indexOf('Not Found') > -1 && err.message.indexOf('Unknown Message') > -1) {
                return;
            }
            app.logger.error(err);
        });
    }

    /**
     * Builds the embed poll message.
     *
     * @param  {String}   message    The poll message.
     * @param  {Number}   seconds    The amount of seconds left before the poll exired.
     * @param  {Boolean}  hasLoaded  Determins if the poll has loaded or not.
     * @return {Object}
     */
    buildPollEmbededMessage(message, seconds, hasLoaded = true) {
        return {
            color: 0x323232,
            description: message,
            footer: {
                text: seconds > 0 ?
                    (hasLoaded ? 'The poll will close in ' + app.process.formatSeconds(seconds, false) : 'Loading poll...') :
                    'The poll has ended'
            }
        };
    }

    /**
     * Edits the poll with the vote tally.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    poll     The poll message.
     * @return {Promise}
     */
    sendTally(message, poll) {
        let tally = {};
        message.reactions.forEach(reaction => {
            if (reaction.emoji.id === this.yesEmoji.id) {
                tally.yes = reaction.count - 1;
            }

            if (reaction.emoji.id === this.noEmoji.id) {
                tally.no = reaction.count - 1;
            }
        });

        let result = '      The poll ended in a draw!';
        if (tally.yes > tally.no) {
            result = ':yesEmoji won the poll by **:votes** votes!';
        } else if (tally.no > tally.yes) {
            result = ':noEmoji won the poll by **:votes** votes!';
        }

        let embed = this.buildPollEmbededMessage(poll, 0);
        embed.description +=
            '\n-----------------------------------------------------------------------------------------------\n' +
            '                                             ' + result;

        embed.description = app.lang.formatResponse(message, embed.description, {
            yes: tally.yes,
            no: tally.no,
            yesEmoji: `<:${this.yesEmoji.name}:${this.yesEmoji.id}>`,
            noEmoji: `<:${this.noEmoji.name}:${this.noEmoji.id}>`,
            votes: Math.max(tally.yes, tally.no) - Math.min(tally.yes, tally.no)
        });

        return message.edit('', embed);
    }

    /**
     * Prepares the poll message by adding
     * the yes and no reactions to it.
     *
     * @param  {IMessage}  message  The message object that the reactions should be added to.
     * @return {Promise}
     */
    preparePoll(message) {
        return message.addReaction(this.yesEmoji).then(() => {
            return message.addReaction(this.noEmoji);
        });
    }
}

module.exports = CreateYesNoPollCommand;
