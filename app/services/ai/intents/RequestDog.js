/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Request dog intent handler, this is used when the someone requests
 * a dog image, all it does is run the >randomdog command for you.
 *
 * @extends {IntentHandler}
 */
class RequestCat extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        let handler = app.bot.commands.RandomDogCommand.handler;

        handler.onCommand(bot.User, this.getMessage(), []);
    }
}

module.exports = RequestCat;
