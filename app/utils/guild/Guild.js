
/**
 * Guild class, used to get information about a guild easily with
 * out having to actually have the guild instance to begin with.
 */
class Guild {

    /**
     * Checks if the two objects belongs to the same guild.
     *
     * @param  {mixed}  firstContext   The first context object.
     * @param  {mixed}  secondContext  The second context object.
     * @return {Boolean}
     */
    isFromSameGuild(firstContext, secondContext) {
        return this.getIdFrom(firstContext) === this.getIdFrom(secondContext);
    }

    /**
     * Gets the guild id from the given context, the object given can
     * be any Discordie object that might interact with a guild.
     *
     * @param  {mixed}  context  The Discordie context that should be used to get the guild id.
     * @return {String|null}
     */
    getIdFrom(context) {
        if (context === null || context === undefined) {
            return null;
        }

        let type = this.getTypeOfObject(context);
        if (type === 'String') {
            return context;
        }

        if (type === 'Object') {
            if (context.hasOwnProperty('id')) {
                return this.getIdFrom(context.id);
            }

            if (context.hasOwnProperty('message')) {
                return this.getIdFrom(context.message);
            }

            if (context.hasOwnProperty('guild')) {
                return this.getIdFrom(context.guild);
            }

            if (context.hasOwnProperty('channel')) {
                return this.getIdFrom(context.channel);
            }

            if (context.hasOwnProperty('guild_id')) {
                return this.getIdFrom(context.guild_id);
            }
        }

        switch (type) {
            case 'IGuild':
                return context.id;

            case 'IMessage':
                return this.getIdFrom(context.guild);

            case 'IChannel':
            case 'ITextChannel':
            case 'IVoiceChannel':
                return context.guild_id;

            case 'VoiceSocket':
                return context.guildId;

            case 'IVoiceConnection':
                return this.getIdFrom(context.guild);

            case 'VoiceConnectionInfo':
                return this.getIdFrom(context.voiceConnection.guild);

            case 'IGuildMember':
                return context.guild_id;

            default:
                return null;
        }
    }

    /**
     * Gets the type of the object given
     *
     * @param  {mixed}  object  The object that should have its type returned.
     * @return {String}
     */
    getTypeOfObject(object) {
        return object.constructor.name;
    }
}

module.exports = new Guild;
