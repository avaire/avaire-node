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
                    lists: 10,
                    songs: 50
                },
                aliases: 50
            }
        },
        {
            id: 2,
            name: 'VIP+',
            limits: {
                playlist: {
                    lists: 25,
                    songs: 100
                },
                aliases: 150
            }
        }
    ]
});

module.exports = GUILD_TYPES_CONSTANTS;
