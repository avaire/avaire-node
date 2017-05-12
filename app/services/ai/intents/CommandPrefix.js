/** @ignore */
const categories = require('../../../bot/commands/Categories');
/** @ignore */
const CommandHandler = require('../../../bot/commands/CommandHandler');
/** @ignore */
const IntentHandler = require('./IntentHandler');

/**
 * Command Prefix intent handler, this is used when someone requests the
 * prefixes for all modules, this will also show custom prefixes for
 * the guild the intent was triggered in.
 *
 * @extends {IntentHandler}
 */
class CommandPrefix extends IntentHandler {

    /**
     * This is invoked by the service provider when the AI
     * returns a matching response action the intent.
     */
    handle() {
        let prefixes = [];
        for (let i in categories) {
            let prefix = CommandHandler.getPrefix(this.getMessage(), categories[i].name);

            prefixes.push(`\`${prefix}\` ${categories[i].name}`);
        }

        return app.envoyer.sendSuccess(this.getMessage(),
            'Here is all my prefixes for this server.\n\n' + prefixes.join('\n')
        );
    }
}

module.exports = CommandPrefix;
