/** @ignore */
const _ = require('lodash');
/** @ignore */
const Job = require('./Job');

/**
 * Change game job, this job runs once every minute of the bots uptime,
 * every cycle the job will roll a number between 1 and 100, if
 * the number is below or equal to 25 a random game from the
 * config.json playing propety will be selected and set to
 * the bots playing status.
 *
 * @extends {Job}
 */
class ChangeGameJob extends Job {

    /**
     * The jobs constructor, this will force a random game
     * to be set in the bots playing status upon creation.
     */
    constructor() {
        super();

        this.run();
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        if (!app.process.isReady) {
            bot.User.setStatus(null, 'loading components...');

            return app.scheduler.scheduleDelayedTask(() => {
                return this.run();
            }, app.config.bot.activationDelay * 1000);
        }

        // If the cache has the custom bot status token it means we have
        // a custom bot status set, so we don't want to overwrite it
        // with the job until it is removed again.
        if (app.cache.has('custom.bot-status', 'memory')) {
            return;
        }

        let game = _.sample(app.config.playing);

        game = game.replace(/%guilds%/gi, bot.Guilds.length);

        bot.User.setStatus(null, game);
    }
}

module.exports = ChangeGameJob;
