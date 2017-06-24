/** @ignore */
const _ = require('lodash');
/** @ignore */
const IntentHandler = require('./IntentHandler');
/** @ignore */
const CommandHandler = require('./../../../bot/commands/CommandHandler');

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
        let speech = this.response.result.fulfillment.speech;

        speech = speech.replace(/\.help/gi, CommandHandler.getPrefix(this.getMessage(), 'help') + 'help');

        return app.envoyer.sendWarn(this.getMessage(), speech);
    }
}

module.exports = Unknown;
