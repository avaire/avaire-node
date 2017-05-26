/** @ignore */
const Command = require('./../Command');

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
                name: 'Active Voice',
                value: bot.VoiceConnections.length,
                inline: true
            });

            fields.push({
                name: 'Servers',
                value: bot.Guilds.length,
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

            return this.getMemberStats();
        }).then(members => {
            fields.push({
                name: 'Members',
                value: [
                    members.totalMembers + ' Total',
                    members.totalOnline + ' Online',
                    members.uniqueMembers + ' Unique',
                    members.uniqueOnline + ' Unique online'
                ].join('\n'),
                inline: true
            });

            return this.getChannelStats();
        }).then(channels => {
            fields.push({
                name: 'Channels',
                value: [
                    channels.totalChannels + ' Total',
                    channels.textChannels + ' Text',
                    channels.voiceChannels + ' Voice'
                ].join('\n'),
                inline: true
            });

            return Promise.resolve();
        }).then(() => {
            let uptime = app.process.getUptime(false).split(', ');
            if (uptime.length > 1) {
                let length = uptime.length - 1;
                uptime[length] = uptime[length].substr(4, uptime[length].length - 1);
            }

            fields.push({
                name: 'Uptime',
                value: uptime.join('\n'),
                inline: true
            });

            return Promise.resolve();
        }).then(() => {
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
                    text: `Created by Senither#8023 using the Discordie framework`
                },
                fields
            });
        });
    }

    getChannelStats() {
        return new Promise((resolve, reject) => {
            resolve(app.cache.remember('bot.stats.channels', 60, () => {
                let channels = bot.Channels.toArray();
                let textChannels = channels.reduce((a, channel) => {
                    return (channel.constructor.name === 'ITextChannel') ? a + 1 : a;
                }, 0);

                return {
                    textChannels,
                    totalChannels: channels.length,
                    voiceChannels: channels.length - textChannels
                };
            }));
        });
    }

    getMemberStats() {
        return new Promise((resolve, reject) => {
            resolve(app.cache.remember('bot.stats.members', 60, () => {
                let guildMembers = bot.Guilds.map(guild => {
                    return guild.members;
                });

                return {
                    totalMembers: guildMembers.reduce((a, b) => {
                        return a + b.length;
                    }, 0),
                    totalOnline: guildMembers.reduce((a, b) => {
                        return a + b.reduce((c, member) => {
                            return (member.status === 'offline') ? c : c + 1;
                        }, 0);
                    }, 0),

                    uniqueMembers: bot.Users.length,
                    uniqueOnline: bot.Users.toArray().reduce((a, member) => {
                        return (member.status === 'offline') ? a : a + 1;
                    }, 0)
                };
            }));
        });
    }

    getMessagesReceivedStats() {
        let perSecond = app.bot.statistics.messages / ((new Date().getTime() - app.runTime) / 1000);

        return app.bot.statistics.messages + ` (${perSecond.toFixed(2)} per sec)`;
    }
}

module.exports = StatsCommand;
