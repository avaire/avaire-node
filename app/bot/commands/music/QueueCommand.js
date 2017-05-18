/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');

class QueueCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('queue', ['songs', 'song'], {
            allowDM: false,
            description: 'Lists all the song currently in the queue.',
            middleware: [
                'require:text.send_messages',
                'throttle.user:2,5'
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
        if (!Music.isConnectedToVoice(message)) {
            return this.sendQueueIsEmpty(message);
        }

        let queue = Music.getQueue(message);
        if (queue.length === 0) {
            return this.sendQueueIsEmpty(message);
        }

        // Begins building the embeded element that should be sent to the user.
        let song = queue[0];
        let embed = {
            color: app.envoyer.colors.info,
            title: app.lang.get(message, 'commands.music.queue.currently-' + (Music.isPaused(message) ? 'paused' : 'playing')),
            description: app.lang.get(message, 'commands.music.queue.playing'),
            fields: [
                {
                    name: app.lang.get(message, 'commands.music.queue.in-queue'),
                    value: app.lang.get(message, 'commands.music.queue.empty-queue')
                }
            ]
        };

        // If the queue has more than one song the additional songs will added to the embeded
        // element showing the first six songs, and if there is more than six, a message
        // about how many more songs in the queue there are will be used instead.
        if (queue.length > 1) {
            let queueString = '';

            for (let i = 1; i < Math.min(queue.length, 6); i++) {
                queueString += `**${i}:** [${queue[i].title.limit(64)}](${queue[i].link}) [${queue[i].duration}]\n`;
            }

            if (queue.length > 6) {
                let length = queue.length - 6;

                let langType = (length === 1) ? 'singular' : 'plural';

                queueString += '\n' + app.lang.get(message, 'commands.music.queue.extra-' + langType, {
                    number: length
                });
            }

            embed.fields[0].value = queueString.trim();
        }

        return app.envoyer.sendEmbededMessage(message, embed, {
            link: song.link,
            title: song.title,
            volume: Music.getVolume(message),
            time: this.getTimeLeft(song.playTime, song.duration),
            requester: `<@${song.requester}>`
        }).then(m => {
            return app.scheduler.scheduleDelayedTask(() => m.delete(), 29500);
        });
    }

    /**
     * Send the music queue is empty message, the
     * message will delete itself after 6 seconds.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    sendQueueIsEmpty(message) {
        return app.envoyer.sendWarn(message, 'commands.music.empty-queue').then(m => {
            return app.scheduler.scheduleDelayedTask(() => m.delete(), 6000);
        });
    }

    /**
     * Gets the amount of time left of the current song.
     *
     * @param  {Number} played      The amount of time that has already been played.
     * @param  {String} time        The formating duration of the song.
     * @param  {Number} multiplier  The multiplier that should be used, defaults to 1.
     * @return {String}
     */
    getTimeLeft(played, time, multiplier = 1) {
        let split = time.split(':');
        let seconds = 0;

        while (split.length > 0) {
            seconds += multiplier * parseInt(split.pop(), 10);
            multiplier *= 60;
        }

        let secondsLeft = seconds - played;

        let h = Math.floor((secondsLeft % 86400) / 3600);
        let m = Math.floor(((secondsLeft % 86400) % 3600) / 60);

        time = m + ':' + Math.floor(((secondsLeft % 86400) % 3600) % 60);

        if (h > 0) {
            time = h + ':' + time;
        }

        return Music.formatDuration(time);
    }
}

module.exports = QueueCommand;
