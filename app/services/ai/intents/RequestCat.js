/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Request cat intent handler, this is used when the someone requests
 * a cat image, all it does is run the >randomcat command for you.
 *
 * @extends {IntentHandler}
 */
class RequestCat extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        let handler = app.bot.commands.RandomCatCommand.handler;

        handler.onCommand(bot.User, this.getMessage(), []);
    }
}

module.exports = RequestCat;
