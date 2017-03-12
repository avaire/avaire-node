module.exports = {
    commands: require('./commands'),
    statistics: require('./RuntimeStatistics'),

    middleware: {
        isBotAdmin: require('./middleware/IsBotAdmin'),
        require: require('./middleware/Require'),
        'throttle.user': require('./middleware/ThrottleUser'),
        'throttle.channel': require('./middleware/ThrottleChannel'),
        'throttle.guild': require('./middleware/ThrottleGuild')
    },

    // Event Handlers
    handlers: {
        // Connection Handlers
        GATEWAY_READY: require('./handlers/GatewayReadyEvent'),
        GATEWAY_RESUMED: require('./handlers/GatewayResumedEvent'),
        DISCONNECTED: require('./handlers/GatewayDisconnectedEvent'),
        // Voice Handlers
        VOICE_CONNECTED: require('./handlers/VoiceConnectedEvent'),
        VOICE_DISCONNECTED: require('./handlers/VoiceDisconnectedEvent'),
        VOICE_CHANNEL_JOIN: require('./handlers/VoiceChannelJoinEvent'),
        VOICE_CHANNEL_LEAVE: require('./handlers/VoiceChannelLeaveEvent'),
        VOICE_USER_MUTE: require('./handlers/VoiceUserMuteEvent'),
        VOICE_USER_DEAF: require('./handlers/VoiceUserDeafEvent'),
        // Text Handlers
        MESSAGE_CREATE: require('./handlers/MessageCreateEvent'),
        MESSAGE_UPDATE: require('./handlers/MessageUpdateEvent'),
        MESSAGE_DELETE: require('./handlers/MessageDeleteEvent'),
        MESSAGE_DELETE_BULK: require('./handlers/MessageDeleteBulkEvent'),
        // Guild Handlers
        GUILD_CREATE: require('./handlers/GuildCreateEvent'),
        GUILD_DELETE: require('./handlers/GuildDeleteEvent'),
        GUILD_UPDATE: require('./handlers/GuildUpdateEvent'),
        GUILD_UNAVAILABLE: require('./handlers/GuildUnavailableEvent'),
        GUILD_MEMBER_ADD: require('./handlers/GuildMemberAddEvent'),
        GUILD_MEMBER_REMOVE: require('./handlers/GuildMemberRemoveEvent'),
        GUILD_MEMBER_UPDATE: require('./handlers/GuildMemberUpdateEvent'),
        GUILD_BAN_ADD: require('./handlers/GuildBanAddEvent'),
        GUILD_BAN_REMOVE: require('./handlers/GuildBanRemoveEvent'),
        GUILD_ROLE_CREATE: require('./handlers/GuildRoleCreateEvent'),
        GUILD_ROLE_UPDATE: require('./handlers/GuildRoleUpdateEvent'),
        GUILD_ROLE_DELETE: require('./handlers/GuildRoleDeleteEvent')
    },

    permissions: {
        // General guild permissions
        'general.administrator': ['General', 'ADMINISTRATOR'],
        'general.manage_roles': ['General', 'MANAGE_ROLES'],
        'general.manage_channels': ['General', 'MANAGE_CHANNELS'],
        'general.kick_members': ['General', 'KICK_MEMBERS'],
        'general.ban_members': ['General', 'BAN_MEMBERS'],
        'general.create_instant_invite': ['General', 'CREATE_INSTANT_INVITE'],
        'general.change_nickname': ['General', 'CHANGE_NICKNAME'],
        'general.manage_nicknames': ['General', 'MANAGE_NICKNAMES'],
        'general.manage_emojis': ['General', 'MANAGE_EMOJIS'],
        'general.manage_webhooks': ['General', 'MANAGE_WEBHOOKS'],
        // Text permissions
        'text.read_messages': ['Text', 'READ_MESSAGES'],
        'text.send_messages': ['Text', 'SEND_MESSAGES'],
        'text.send_tts_messages': ['Text', 'SEND_TTS_MESSAGES'],
        'text.manage_messages': ['Text', 'MANAGE_MESSAGES'],
        'text.embed_links': ['Text', 'EMBED_LINKS'],
        'text.attach_files': ['Text', 'ATTACH_FILES'],
        'text.read_message_history': ['Text', 'READ_MESSAGE_HISTORY'],
        'text.mention_everyone': ['Text', 'MENTION_EVERYONE'],
        'text.external_emotes': ['Text', 'EXTERNAL_EMOTES'],
        'text.add_reactions': ['Text', 'ADD_REACTIONS'],
        // Voice permissions
        'voice.connect': ['Voice', 'CONNECT'],
        'voice.speak': ['Voice', 'SPEAK'],
        'voice.mute_members': ['Voice', 'MUTE_MEMBERS'],
        'voice.deafen_members': ['Voice', 'DEAFEN_MEMBERS'],
        'voice.move_members': ['Voice', 'MOVE_MEMBERS'],
        'voice.use_vad': ['Voice', 'USE_VAD']
    }
};
