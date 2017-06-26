/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = require('./../Command');

/**
 * Setup Command, helps you setup different features for the bot.
 *
 * @extends {Command}
 */
class SetupCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('setup', [], {
            allowDM: false,
            middleware: [
                'require.user:general.administrator',
                'throttle.guild:2,5'
            ]
        });

        /**
         * The feature list that can be interacted with via the command.
         *
         * @type {Object}
         */
        this.features = {
            music: require('./setup/MusicFeature')
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
        if (args.length === 0) {
            return this.sendFeatureList(sender, message, args);
        }

        let feature = this.getFeature(args.join(' '));

        if (feature === null || !feature.canBeFixedViaCommand) {
            return app.envoyer.sendWarn(message, 'Invalid feature given, there are no features that can be setup via this command called `:feature`', {
                feature: args.join(' ')
            });
        }
        return feature.execute(sender, message);
    }

    /**
     * Sends the feature list for the features that
     * are not enabled for the current server.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {Promise}
     */
    sendFeatureList(sender, message, args) {
        let command = this.getCommandTrigger(message);
        let fields = [];

        for (let token in this.features) {
            let feature = this.features[token];

            if (feature.isSetup(sender, message)) {
                continue;
            }

            let description = feature.description;
            if (feature.canBeFixedViaCommand) {
                description += `\n\n**or run**\n\`\`\`${command} ${token}\`\`\``;
            }

            fields.push({
                name: `${feature.name}`,
                value: description
            });
        }

        if (Object.keys(fields).length === 0) {
            return app.envoyer.sendEmbededMessage(message, {
                color: app.envoyer.colors.success,
                title: 'Feature List',
                description: 'All features that can be setup has already been setup for the server.'
            });
        }

        return app.envoyer.sendEmbededMessage(message, {
            color: app.envoyer.colors.info,
            title: 'Feature List',
            description: [
                'Below you\'ll find a list of features that are not enabled or doesn\'t work on the server',
                'right now, and how you can fix it, some features can also be fixed using the setup',
                'command followed by the feature you wanna setup.',
                '-----------------------------------------------------------------------------------------------'
            ].join('\n'),
            fields
        });
    }

    /**
     * Get the feature with the given name.
     *
     * @param  {String}  name  The name of the feature that should be fetched.
     * @return {String|null}
     */
    getFeature(name) {
        name = name.toLowerCase();

        for (let feature in this.features) {
            if (feature.toLowerCase() === name) {
                return this.features[feature];
            }
        }
        return null;
    }
}

module.exports = SetupCommand;
