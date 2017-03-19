/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Unknown intent handler, this is used when the
 * ai doesn't know what the user input was.
 *
 * @extends {IntentHandler}
 */
class Unknown extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        app.envoyer.sendWarn(this.getMessage(), 'I\'m not sure what you mean');
    }
}

module.exports = Unknown;
