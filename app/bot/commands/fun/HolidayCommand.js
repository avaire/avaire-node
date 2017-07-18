/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class HolidayCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('holiday', [], {
            middleware: [
                'throttle.channel:1,2'
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
        if (!this.hasValidAPIKey()) {
            return app.envoyer.sendError(message, [
                'This command needs a valid [holidayapi.com](https://holidayapi.com/) api token, an',
                'invalid token or no token has been given so the command is currently disabled.'
            ].join(' '));
        }

        if (app.cache.has(this.cachePath)) {
            return this.sendHolidayStatus(message);
        }

        return request(this.apiEndpoint, (error, response, body) => {
            try {
                let parsed = JSON.parse(body);

                app.cache.put(this.cachePath, parsed, 60 * 60 * 24);

                return this.sendHolidayStatus(message);
            } catch (err) {
                app.logger.error(err);
                return app.envoyer.sendError(message, 'The API returned an unconventional response.');
            }
        });
    }

    /**
     * Send the holiday status to the user.
     *
     * @param  {IMessage}  message  The Discordie message object.
     * @return {Promise}
     */
    sendHolidayStatus(message) {
        let holidays = app.loadProperty(app.cache.get(this.cachePath, {
            status: 200,
            holidays: []
        }), ['holidays']);

        if (holidays === null) {
            holidays = [];
        }

        if (holidays.length === 0) {
            return app.envoyer.sendMessage(message, 'No holidays today... get back to work!', 0x2A2C31);
        }

        return app.envoyer.sendEmbededMessage(message, {
            color: 0x2A2C31,
            description: `Today is **${holidays[0].name}**`
        });
    }

    /**
     * Checks if the config has a valid API token.
     *
     * @return {Boolean}
     */
    hasValidAPIKey() {
        if (!app.config.apiKeys.hasOwnProperty('holidayapi')) {
            return false;
        }

        let token = app.config.apiKeys.holidayapi;
        if (token.length < 32) {
            return false;
        }

        return /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/g.test(token);
    }

    /**
     * Gets the cache path for the day.
     *
     * @return {String}
     */
    get cachePath() {
        let date = new Date;

        return `holiday.${date.getMonth()}.${date.getDate()}`;
    }

    /**
     * Gets the full API endpoint.
     *
     * @return {String}
     */
    get apiEndpoint() {
        let date = new Date;

        return `https://holidayapi.com/v1/holidays?key=${app.config.apiKeys.holidayapi}&country=US&year=2016&month=${date.getMonth()}&day=${date.getDay()}`;
    }
}

module.exports = HolidayCommand;
