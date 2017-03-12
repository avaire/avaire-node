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

        this.setRandomGame();
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        if (Math.random() * 100 <= 25) {
            this.setRandomGame();
        }
    }

    /**
     * Sets a random game from the config.json playing
     * properpty as the bots playing status.
     */
    setRandomGame() {
        bot.User.setStatus(null, {
            name: _.sample(app.config.playing)
        });
    }
}

module.exports = ChangeGameJob;
