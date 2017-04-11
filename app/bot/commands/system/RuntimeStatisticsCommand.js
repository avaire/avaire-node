/** @ignore */
const Command = require('./../Command');

class RuntimeStatisticsCommand extends Command {
    constructor() {
        super(';', 'rstats', ['stats'], {
            middleware: [
                'isBotAdmin'
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
        let members = this.getMemberStats();
        let channels = this.getChannelStats();

        return message.channel.sendMessage('', false, {
            timestamp: new Date,
            color: 0x3498DB,
            title: 'Runtime Bot Statistics',
            url: 'https://discordapp.com/invite/gt2FWER',
            author: {
                icon_url: `https://cdn.discordapp.com/avatars/${bot.User.id}/${bot.User.avatar}.png?size=256`,
                name: `${bot.User.username} v${app.version}`
            },
            fields: [
                {
                    name: 'Members',
                    value: [
                        members.totalMembers + ' Total',
                        members.totalOnline + ' Online',
                        members.uniqueMembers + ' Unique',
                        members.uniqueOnline + ' Unique online'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: 'Channels',
                    value: [
                        channels.totalChannels + ' Total',
                        channels.textChannels + ' Text',
                        channels.voiceChannels + ' Voice'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: 'Memory Usage',
                    value: this.getSystemMemoryUsage(),
                    inline: true
                },
                {
                    name: 'Servers',
                    value: bot.Guilds.length,
                    inline: true
                },
                {
                    name: 'DB Queries run',
                    value: app.bot.statistics.databaseQueries,
                    inline: true
                },
                {
                    name: 'Commands run',
                    value: app.bot.statistics.commands,
                    inline: true
                }
            ],
            footer: {
                text: `Created by Senither#8023 using the Discordie framework`
            }
        });
    }

    getChannelStats() {
        return app.cache.remember('bot.stats.channels', 60, () => {
            let channels = bot.Channels.toArray();
            let textChannels = channels.reduce((a, channel) => {
                return (channel.constructor.name === 'ITextChannel') ? a + 1 : a;
            }, 0);

            return {
                totalChannels: channels.length,
                textChannels,
                voiceChannels: channels.length - textChannels
            };
        });
    }

    getMemberStats() {
        return app.cache.remember('bot.stats.members', 60, () => {
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
        });
    }

    getSystemMemoryUsage() {
        let memoryInBytes = process.memoryUsage().heapTotal - process.memoryUsage().heapUsed;
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        let k = 1000;
        let i = Math.floor(Math.log(memoryInBytes) / Math.log(k));

        return parseFloat((memoryInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = RuntimeStatisticsCommand;
