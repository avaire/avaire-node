/** @ignore */
const Feature = require('./Feature');

/**
 * Music Feature, this feature is used to create the music
 * DJ role for the server is it doesn't already exists.
 *
 * @extends {Feature}
 */
class MusicFeature extends Feature {

    /**
     * The name of the feature.
     *
     * @return {String}
     */
    get name() {
        return 'Music DJ Role';
    }

    /**
     * The description of the feature.
     *
     * @return {String}
     */
    get description() {
        return 'You can create a role called `DJ` and assign it to yourself and others who should be able to manage music features.';
    }

    /**
     * Determins if the feature can be setup via a command.
     *
     * @return {Boolean}
     */
    get canBeFixedViaCommand() {
        return true;
    }

    /**
     * Checks if the feature is already setup.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Boolean}
     */
    isSetup(sender, message) {
        let roles = message.guild.roles;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name.toUpperCase() === 'DJ') {
                return true;
            }
        }
        return false;
    }

    /**
     * Executes the given feature.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {mixed}
     */
    execute(sender, message) {
        if (!app.permission.botHas(message, 'general.manage_roles')) {
            return app.envoyer.sendWarn(message, [
                'I don\'t have permissions to create roles so I can\'t setup the music `DJ` role for you.',
                '',
                '**Description:**',
                this.description
            ].join('\n'));
        }

        if (this.isSetup(sender, message)) {
            return app.envoyer.sendWarn(message, 'The music `DJ` role already exists for this server.');
        }

        message.channel.sendTyping();

        return message.guild.createRole().then(role => {
            return role.commit('DJ', 0x158CD8, false, false).then(() => {
                return message.member.assignRole(role).then(() => {
                    return app.envoyer.sendInfo(message,
                        'The `DJ` role has been created and assigned to yourself, you can give the role to other people you want to be able to manage the music features as well.'
                    );
                });
            });
        });
    }
}

module.exports = new MusicFeature;
