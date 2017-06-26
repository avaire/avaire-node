/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./../music/MusicHandler');

/**
 * Stats command, shows information about the bot instance,
 * version number and a bunch of other things to the user.
 *
 * @extends {Command}
 */
class StatsCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('stats', ['about'], {
            middleware: [
                'throttle.channel:1,5'
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
        let description = 'Created by Senither#8023 using the Discordie framework!';
        if (app.cache.has('github.commits')) {
            description = '**Latest changes:**\n';

            app.cache.get('github.commits').slice(0, 3).forEach(commit => {
                let message = commit.commit.message.split('\n')[0];
                description += `[\`${commit.sha.substr(0, 7)}\`](${commit.html_url}) ${message.limit(72)}\n`;
            });
        }

        let fields = [
            // First line
            this.buildEmbedItem('Author', 'Senither#8023'),
            this.buildEmbedItem('Bot ID', bot.User.id),
            this.buildEmbedItem('Library', '[Discordie](http://qeled.github.io/discordie/)'),

            // Second line
            this.buildEmbedItem('DB Queries run', this.getDatabaseQueriesStats()),
            this.buildEmbedItem('Messages Received', this.getMessagesReceivedStats()),
            this.buildEmbedItem('Shard ID', app.shard.getId() + 1),

            // Third line
            this.buildEmbedItem('Commands Run', app.bot.statistics.commands),
            this.buildEmbedItem('Memory Usage', app.process.getSystemMemoryUsage()),
            this.buildEmbedItem('Uptime', app.process.getUptime()),

            // Fourth line
            this.buildEmbedItem('Members', () => {
                if (app.shard.isEnabled()) {
                    return [
                        app.shard.getUsers() + ' Total',
                        bot.Users.length + ' in shard'
                    ].join('\n');
                }
                return app.shard.getUsers() + ' Total';
            }),
            this.buildEmbedItem('Channels', () => {
                if (app.shard.isEnabled()) {
                    return [
                        app.shard.getChannels() + ' Total',
                        bot.Channels.length + ' in shard'
                    ].join('\n');
                }
                return app.shard.getChannels() + ' Total';
            }),
            this.buildEmbedItem('Servers', () => {
                if (app.shard.isEnabled()) {
                    return [
                        app.shard.getGuilds() + ' Total',
                        bot.Guilds.length + ' in shard'
                    ].join('\n');
                }
                return app.shard.getGuilds() + ' Total';
            })
        ];

        let songsInQueue = this.getSongsInQueue();
        let servers = bot.VoiceConnections.length;

        return app.envoyer.sendEmbededMessage(message, {
            timestamp: new Date,
            color: 0x3498DB,
            url: 'https://discordapp.com/invite/gt2FWER',
            title: 'Official Bot Server Invite',
            description: description.trim(),
            author: {
                icon_url: `https://cdn.discordapp.com/avatars/${bot.User.id}/${bot.User.avatar}.png?size=256`,
                name: `${bot.User.username} v${app.version}`
            },
            footer: {
                text: `Currenting playing in ${servers} servers with ${songsInQueue} songs in the queue.`
            },
            fields
        });
    }

    /**
     * Builds a embeded item.
     *
     * @param  {String}  name   The name of the item.
     * @param  {mixed}   value  The value of the item.
     * @return {Object}
     */
    buildEmbedItem(name, value) {
        let obj = {name, value, inline: true};

        if (value.constructor.name === 'Function') {
            obj.value = value();
        }
        return obj;
    }

    /**
     * Gets the amount of songs currently in the music queue.
     *
     * @return {Number}
     */
    getSongsInQueue() {
        let songsInQueue = 0;
        for (let guildId in Music.queues) {
            songsInQueue += Music.queues[guildId].length;
        }
        return songsInQueue;
    }

    /**
     * Gets the number of database queries that has been run since the bot was
     * started, as well as how many queries has been run per minute on average.
     *
     * @return {String}
     */
    getDatabaseQueriesStats() {
        let perSecond = app.bot.statistics.databaseQueries / ((new Date().getTime() - app.runTime) / (1000 * 60));

        return app.bot.statistics.databaseQueries + ` (${perSecond.toFixed(2)} per min)`;
    }

    /**
     * Gets the messages received and how many the bot
     * have gotten every second since it started.
     *
     * @return {String}
     */
    getMessagesReceivedStats() {
        let perSecond = app.bot.statistics.messages / ((new Date().getTime() - app.runTime) / 1000);

        return app.bot.statistics.messages + ` (${perSecond.toFixed(2)} per sec)`;
    }
}

module.exports = StatsCommand;
