/** @ignore */
const _ = require('lodash');
/** @ignore */
const moment = require('moment');
/** @ignore */
const Command = require('./../Command');

class ServerInfoCommand extends Command {
    constructor() {
        super('.', 'serverinfo', ['sinfo'], {
            allowDM: false,
            description: 'Tells you information about the server.',
            middleware: [
                'throttle.channel:2,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        let guild = message.guild;
        let createdAt = moment(guild.joined_at);
        let owner = message.guild.members.find(member => member.id === guild.owner_id);
        let botRoles = _.orderBy(message.guild.members.find(member => {
            return member.id === bot.User.id;
        }).roles, 'position', 'desc');

        let fields = [
            {
                name: 'ID',
                value: guild.id,
                inline: true
            },
            {
                name: 'Owner',
                value: `${owner.username}#${owner.discriminator}`,
                inline: true
            },
            {
                name: 'Text Channels',
                value: guild.textChannels.length,
                inline: true
            },
            {
                name: 'Voice Channels',
                value: guild.voiceChannels.length,
                inline: true
            },
            {
                name: 'Members',
                value: guild.member_count,
                inline: true
            },
            {
                name: 'Roles',
                value: guild.roles.length,
                inline: true
            },
            {
                name: 'Region',
                value: this.getGuildRegion(guild),
                inline: true
            },
            {
                name: 'Created At',
                value: createdAt.format('ddd, Q MMM YYYY HH:mm:ss zz') + '\n*About ' + createdAt.fromNow() + '*',
                inline: true
            }
        ];

        if (guild.emojis.length !== 0) {
            let emojis = [];

            for (let i in guild.emojis) {
                let emoji = guild.emojis[i];
                emojis.push(`${emoji.name} <:${emoji.name}:${emoji.id}>`);
            }

            fields.push({
                name: `Custom Emojis (${emojis.length})`,
                value: emojis.join(', '),
                inline: true
            });
        }

        return app.envoyer.sendEmbededMessage(message, {
            color: this.getEmbededColor(botRoles),
            title: guild.name,
            thumbnail: {
                url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
            },
            fields
        });
    }

    getEmbededColor(roles) {
        for (let index in roles) {
            let role = roles[index];

            if (role.color > 0) {
                return role.color;
            }
        }

        return 0x686A6E;
    }

    getGuildRegion(guild) {
        let region = guild.region.split('-');

        if (region.length === 1) {
            return region[0].firstToUpper();
        }

        return region[0].toUpperCase() + ' ' + region[1].firstToUpper();
    }
}

module.exports = ServerInfoCommand;
