module.exports = {
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
};
