/**
 * A list of guild type constants.
 *
 * @type {Object}
 */
const GUILD_TYPES_CONSTANTS = Object.freeze({
    GUILD_TYPES: [
        {
            id: 1,
            name: 'VIP',
            limits: {
                playlist: {
                    lists: 5,
                    songs: 25
                }
            }
        }
    ]
});

module.exports = GUILD_TYPES_CONSTANTS;
