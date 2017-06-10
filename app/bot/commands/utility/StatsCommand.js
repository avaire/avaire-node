/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./../music/MusicHandler');

class StatsCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('stats', ['about'], {
            description: 'Tells you information about the bot itself.',
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

        let fields = [];

        return Promise.resolve().then(() => {
            fields.push({
                name: 'Author',
                value: 'Senither#8023',
                inline: true
            });

            fields.push({
                name: 'Bot ID',
                value: bot.User.id,
                inline: true
            });

            fields.push({
                name: 'Library',
                value: '[Discordie](http://qeled.github.io/discordie/)',
                inline: true
            });

            fields.push({
                name: 'DB Queries run',
                value: app.bot.statistics.databaseQueries,
                inline: true
            });

            fields.push({
                name: 'Messages Received',
                value: this.getMessagesReceivedStats(),
                inline: true
            });

            fields.push({
                name: 'Shard ID',
                value: app.shard.getId(),
                inline: true
            });

            fields.push({
                name: 'Commands Run',
                value: app.bot.statistics.commands,
                inline: true
            });

            fields.push({
                name: 'Memory Usage',
                value: app.process.getSystemMemoryUsage(),
                inline: true
            });

            fields.push({
                name: 'Uptime',
                value: app.process.getUptime(),
                inline: true
            });

            return Promise.resolve();
        }).then(() => {
            fields.push({
                name: 'Members',
                value: [
                    app.shard.getUsers() + ' Total',
                    bot.Users.length + ' in shard'
                ].join('\n'),
                inline: true
            });

            return Promise.resolve();
        }).then(() => {
            fields.push({
                name: 'Channels',
                value: [
                    app.shard.getChannels() + ' Total',
                    bot.Channels.length + ' in shard'
                ].join('\n'),
                inline: true
            });

            return Promise.resolve();
        }).then(() => {
            fields.push({
                name: 'Servers',
                value: [
                    app.shard.getGuilds() + ' Total',
                    bot.Guilds.length + ' in shard'
                ].join('\n'),
                inline: true
            });

            return Promise.resolve();
        }).then(() => {
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
        });
    }

    getSongsInQueue() {
        let songsInQueue = 0;
        for (let guildId in Music.queues) {
            songsInQueue += Music.queues[guildId].length;
        }
        return songsInQueue;
    }

    getMessagesReceivedStats() {
        let perSecond = app.bot.statistics.messages / ((new Date().getTime() - app.runTime) / 1000);

        return app.bot.statistics.messages + ` (${perSecond.toFixed(2)} per sec)`;
    }
}

module.exports = StatsCommand;
