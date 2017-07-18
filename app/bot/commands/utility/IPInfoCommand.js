/** @ignore */
const request = require('request');
/** @ignore */
const Command = require('./../Command');

class IPInfoCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('ipinfo', [], {
            usage: '<address>',
            middleware: [
                'throttle.user:1,5'
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
        if (args.length === 0) {
            return this.sendMissingArguments(message);
        }

        let address = args[0];
        if (!this.isValidIp(address)) {
            return app.envoyer.sendWarn(message, 'Invalid IP address given, you must parse a valid IP address ');
        }

        return request(`http://ipinfo.io/${address}/json`, (error, response, body) => {
            try {
                let data = JSON.parse(body);

                return app.envoyer.sendEmbededMessage(message, {
                    color: 0x005A8C,
                    title: address,
                    fields: [
                        {
                            name: 'Hostname',
                            value: data.hostname ? data.hostname : 'Unknown',
                            inline: true
                        },
                        {
                            name: 'Organisation',
                            value: data.org ? data.org : 'Unknown',
                            inline: true
                        },
                        {
                            name: 'Country',
                            value: this.getCountry(data)
                        }
                    ],
                    footer: {
                        text: `Requested by ${message.author.username}#${message.author.discriminator} (${message.author.id})`
                    }
                });
            } catch (err) {
                app.logger.error(err);
                return app.envoyer.sendError(message, 'The API returned an unconventional response.');
            }
        });
    }

    /**
     * Checks if the given IP address is a valid IPv4 address.
     *
     * @param  {String}  address  The IP address that should be checked.
     * @return {Boolean}
     */
    isValidIp(address) {
        return /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/.test(address);
    }

    /**
     * Gets the country and flag of the country from the given data.
     *
     * @param  {Object}  data  The object of data returned from the API request.
     * @return {String}
     */
    getCountry(data) {
        let flag = '';
        if (data.country) {
            flag = `:flag_${data.country.toLowerCase()}: `;
        }

        return `${flag}${data.city ? data.city : 'Unknown'}, ${data.region ? data.region : 'Unknown'} (${data.loc ? data.loc : 'Unknown'})`;
    }
}

module.exports = IPInfoCommand;
