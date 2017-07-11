
/**
 * Shard server logger, allows the bot to log create or delete
 * guild events via webhooks to the main server for the bot.
 */
class ServerLogger {

    /**
     * Prepares the Server Logger instance.
     */
    constructor() {
        /**
         * The server log data that should be sent
         * to the main server via a webhook.
         *
         * @type {Array}
         */
        this.data = [];
    }

    /**
     * Pulls the data from the logger, returning the
     * data and deleting it in the process.
     *
     * @return {Array}
     */
    pullData() {
        let result = this.data;
        this.data = [];

        return result;
    }

    /**
     * Creates a create/add server log message.
     *
     * @param  {Objecct}  data  The data that should be logged.
     * @return {Boolean}
     */
    create(data) {
        return this.addData(data, 'Added', 0x66BB6A);
    }

    /**
     * Creates a delete/remove server log message.
     *
     * @param  {Objecct}  data  The data that should be logged.
     * @return {Boolean}
     */
    delete(data) {
        return this.addData(data, 'Removed', 0xEF5350);
    }

    /**
     * Adds the data to the logger data property.
     *
     * @param {Object}  data   The data that should be logged.
     * @param {String}  title  The title that the logged message should have.
     * @param {Number}  color  The hex color that the logged message should have,
     * @return {Boolean}
     */
    addData(data, title, color) {
        if (!this.isEnabled) {
            return false;
        }

        data.title = title;
        data.color = color;
        data.timestamp = new Date;

        return this.data.push(data) === 1;
    }

    /**
     * Checks if the server logger is enabled.
     *
     * @return {Boolean}
     */
    get isEnabled() {
        if (!app.config.hasOwnProperty('webhook')) {
            return false;
        }

        if (
            !app.config.webhook.hasOwnProperty('id') ||
            !app.config.webhook.hasOwnProperty('token')
        ) {
            return false;
        }

        if (app.config.webhook.id.length < 15 || app.config.webhook.token.length < 50) {
            return false;
        }
        return true;
    }
}

module.exports = new ServerLogger;
