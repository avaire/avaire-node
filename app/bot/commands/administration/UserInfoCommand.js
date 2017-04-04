/** @ignore */
const _ = require('lodash');
/** @ignore */
const moment = require('moment');
/** @ignore */
const Command = require('./../Command');

class UserInfoCommand extends Command {
    constructor() {
        super('.', 'userinfo', ['uinfo'], {
            allowDM: false,
            description: 'Tells you information about the taged user, or yourself.',
            middleware: [
                'throttle.user:2,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        let user = message.member;

        if (message.mentions.length > 0) {
            user = bot.Users.getMember(message.guild, message.mentions[0]);
        }

        let roles = _.orderBy(user.roles, 'position', 'desc');
        let joinedAt = moment(user.joined_at);
        let createdAt = moment(user.registeredAt);

        let listOfRoles = roles.map(role => role.name).join('\n').trim();

        return app.envoyer.sendEmbededMessage(message, {
            color: this.getEmbededColor(roles),
            thumbnail: {
                url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
            },
            fields: [
                {
                    name: 'Username',
                    value: `**${user.username}**#${user.discriminator}`,
                    inline: true
                },
                {
                    name: 'User ID',
                    value: `${user.id}`,
                    inline: true
                },
                {
                    name: 'Joined Server',
                    value: joinedAt.format('ddd, Q MMM YYYY HH:mm:ss zz') + '\n*About ' + joinedAt.fromNow() + '*',
                    inline: true
                },
                {
                    name: 'Joined Discord',
                    value: createdAt.format('ddd, Q MMM YYYY HH:mm:ss zz') + '\n*About ' + createdAt.fromNow() + '*',
                    inline: true
                },
                {
                    name: `Roles *(${roles.length})*`,
                    value: listOfRoles.length === 0 ? '*This user is not in any roles*' : listOfRoles,
                    inline: true
                },
                {
                    name: 'Servers',
                    value: this.getUsersInGuild(user.id, message.guild.id),
                    inline: true
                }
            ]
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

    getUsersInGuild(userId, guildId) {
        let servers = 0;

        bot.Guilds.forEach(guild => {
            if (guild.members.find(member => member.id === userId) !== null) {
                servers++;
            }
        });

        return `${servers} the bot knows about`;
    }
}

module.exports = UserInfoCommand;
