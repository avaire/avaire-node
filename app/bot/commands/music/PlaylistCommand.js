/** @ignore */
const URL = require('url');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const YouTubeDL = require('youtube-dl');
/** @ignore */
const Command = require('./../Command');
/** @ignore */
const Music = require('./MusicHandler');
/** @ignore */
const CommandHandler = require('./../CommandHandler');
/** @ignore */
const PlaylistTransformer = require('./../../../database/transformers/PlaylistTransformer');

class Playlist extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('playlist', ['list', 'pl'], {
            allowDM: false,
            description: [
                'Music playlist command, alows music DJs to create, delete, and load playlists to the music queue, as well as adding and removing songs from any of the playlists.'
            ],
            middleware: [
                'require:text.send_messages',
                'throttle.channel:2,4'
            ],
            usage: [
                '[name] add [song link]',
                '[name] create',
                '[name] delete',
                '[name] load',
                '[name] [page number]'
            ]
        });

        this.playlistCommands = [
            {
                triggers: ['add', 'a'],
                function: (...args) => this.addSongToPlaylist(...args)
            },
            {
                triggers: ['delete'],
                function: (...args) => this.deletePlaylist(...args)
            },
            {
                triggers: ['load', 'l', 'play'],
                function: (...args) => this.loadPlaylist(...args)
            }
        ];

        this.playlistCreateCommand = {
            triggers: ['create', 'c']
        };
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
        if (!Music.userHasDJRole(message.member)) {
            return app.envoyer.sendWarn(message, 'commands.music.missing-role');
        }

        return this.getGuildAndPlaylists(message).then(({guild, playlists}) => {
            if (args.length === 0) {
                return this.sendPlaylists(message, guild, playlists);
            }

            if (playlists.length === 0 && args.length === 0) {
                return app.envoyer.sendInfo(message, 'This server does not have any music playlists yet, you can create one with\n`:command` to get started', {
                    command: this.getPrefix(message) + this.getTriggers()[0] + ' <name> create'
                });
            }

            let playlist = this.getPlaylist(playlists, args[0].toLowerCase());
            if (playlist === null) {
                if (args.length > 1 && _.indexOf(this.playlistCreateCommand.triggers, args[1].toLowerCase()) >= 0) {
                    return this.createPlaylist(message, args, guild, playlists);
                }

                return app.envoyer.sendWarn(message, 'There are no playlists called `:playlist`, you can create the playlist by using the\n`:command` command', {
                    command: this.getPrefix(message) + this.getTriggers()[0] + ' <name> create',
                    playlist: args[0]
                });
            }

            if (playlist !== null && args.length === 1) {
                return this.sendSongsInPlaylist(message, guild, playlist);
            }

            let trigger = args[1].toLowerCase();
            for (let i in this.playlistCommands) {
                let property = this.playlistCommands[i];

                if (_.indexOf(property.triggers, trigger) === -1) {
                    continue;
                }
                return property.function(message, _.drop(args, 2), guild, playlist);
            }

            if (_.indexOf(this.playlistCreateCommand.triggers, trigger) >= 0) {
                return this.createPlaylist(message, args, guild, playlists);
            }

            let pageNumber = parseInt(trigger, 10);
            if (!isNaN(pageNumber)) {
                return this.sendSongsInPlaylist(message, guild, playlist, pageNumber);
            }

            return app.envoyer.sendWarn(message, 'Invalid `property` given, there are no playlist properties called `:property`.\nYou can learm more by running `:helpcommand :command`', {
                property: trigger,
                helpcommand: CommandHandler.getPrefix(message, 'help') + 'help',
                command: this.getPrefix(message) + this.getTriggers()[0]
            });
        });
    }

    createPlaylist(message, args, guild, playlists) {
        if (this.getPlaylist(playlists, args[0]) !== null) {
            return app.envoyer.sendWarn(message, 'Playlist already exists');
        }

        let limit = guild.getType().get('limits.playlist.lists', 3);
        if (playlists.length >= limit) {
            return app.envoyer.sendWarn(message, 'The server doesn\'t have any more playlist slots, you can delete existing playlists to free up slots.');
        }

        let playlist = new PlaylistTransformer({
            guild_id: message.guild.id,
            name: args[0]
        });

        return app.database.insert(app.constants.PLAYLIST_TABLE_NAME, {
            guild_id: message.guild.id,
            name: args[0]
        }).then(() => {
            app.cache.forget('database-playlist.' + message.guild.id, 'memory');

            return app.envoyer.sendSuccess(message, 'The `:playlist` playlist has been been created successfully!\nYou can start adding songs to it with `:command :playlist add <song>`', {
                command: this.getPrefix(message) + this.getTriggers()[0],
                playlist: args[0]
            });
        });
    }

    loadPlaylist(message, args, guild, playlist) {
        return Music.prepareVoice(message).then(() => {
            let queueSize = Music.getQueue(message).length;

            let songs = playlist.get('songs');
            for (let i in songs) {
                let song = songs[i];

                Music.addToQueue(message, song, song.link);
            }

            // If the queue was empty before we'll force the bot to start
            // playing the song that was just requested immediately.
            if (queueSize === 0) {
                Music.next(message);
            }

            return app.envoyer.sendInfo(message, '`:amount` songs has been loaded into the music queue!', {
                amount: songs.length
            });
        }).catch(err => app.envoyer.sendWarn(message, err.message, err.placeholders));
    }

    addSongToPlaylist(message, args, guild, playlist) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'Invalid format, missing song `url`\n`:command`', {
                command: this.getPrefix(message) + this.getTriggers()[0] + ` ${playlist.get('name')} add <song url>`
            });
        }

        let guildType = guild.getType();
        if (playlist.get('songs', []).length >= guildType.get('limits.playlist.songs')) {
            return app.envoyer.sendWarn(message, 'The `:playlist` playlist doesn\'t have any more song slots.', {
                playlist: playlist.get('name')
            });
        }

        let songUrl = args[0];
        let parsedUrl = URL.parse(songUrl);

        if (parsedUrl.host === null) {
            return app.envoyer.sendWarn(message, 'Invalid URL given, you can only add songs to the playlist by links!');
        }

        message.channel.sendTyping();
        this.fetchSong(message, songUrl).then(song => {
            Music.unnecessaryProperties.forEach(property => {
                if (song.hasOwnProperty(property)) {
                    delete song[property];
                }
            });
            song.link = songUrl;

            let playlistSongs = playlist.get('songs', []);
            playlistSongs.push(song);
            playlist.data.songs = playlistSongs;
            playlist.data.amount = playlist.get('amount', 0) + 1;

            return app.database.update(
                app.constants.PLAYLIST_TABLE_NAME, playlist.toDatabaseBindings(),
                query => query.where('id', playlist.get('id')).andWhere('guild_id', message.guild.id)
            ).then(() => {
                return app.envoyer.sendSuccess(message, 'Successfully add `:songname` to the `:playlist` playlist.\nThe `:playlist` playlist has `:slots` more song slots available.', {
                    songname: song.title,
                    playlist: playlist.get('name'),
                    slots: guildType.get('limits.playlist.songs') - playlistSongs.length
                });
            }).catch(err => app.logger.error(err));
        }).catch(err => {
            app.logger.error('Failed to add a song to the queue: ', err);

            return app.envoyer.sendError(message, 'commands.music.require.error');
        });
    }

    deletePlaylist(message, args, guild, playlist) {
        return app.database.getClient().table(app.constants.PLAYLIST_TABLE_NAME).where({
            guild_id: playlist.get('guild_id'),
            id: playlist.get('id')
        }).del().then(() => {
            app.cache.forget('database-playlist.' + message.guild.id, 'memory');

            return app.envoyer.sendInfo(message, 'The `:name` playlist has been deleted successfully!', {
                name: playlist.get('name')
            });
        });
    }

    fetchSong(message, url) {
        return new Promise((resolve, reject) => {
            let options = ['--skip-download', '-f bestaudio/worstvideo'];

            if (url.indexOf('youtu') > -1) {
                options.push('--add-header', 'Authorization:' + app.config.apiKeys.google);
            }

            YouTubeDL.getInfo(url, options, {maxBuffer: 250000000}, (err, song) => {
                if (err) {
                    return reject(err);
                }

                if (song.hasOwnProperty('webpage_url')) {
                    url = song.webpage_url;
                }

                // Filters through all of the song formants to make sure all the song
                // candidates is in a webm format and has an average audio bitrate
                // that's suitable for streaming via Discord.
                let formats = song.formats.filter(format => {
                    return format.ext === 'webm' && format.abr > 0;
                }).sort((a, b) => a.abr - b.abr);

                // Attempts to find the best bitrate audio version of the song.
                let audio = formats.find(format => format.abr > 0 && !format.tbr) ||
                            formats.find(format => format.abr > 0);

                if (audio !== undefined) {
                    song.url = audio.url;
                }

                return resolve(song);
            });
        });
    }

    sendPlaylists(message, guild, playlists) {
        let guildType = guild.getType();
        let counter = `   ‍   [ ${playlists.length} out of ${guildType.get('limits.playlist.lists')} ]`;

        if (playlists.length === 0) {
            return app.envoyer.sendEmbededMessage(message, {
                color: 0x3498DB,
                title: `:musical_note: Music Playlist ${counter}`,
                description: 'This server does not have any music playlists yet, you can create one with\n`:command` to get started'
            }, {
                command: this.getPrefix(message) + this.getTriggers()[0] + ' <name> create'
            });
        }

        let stringMessage = [];
        playlists.forEach(playlist => {
            stringMessage.push(
                playlist.get('name') + '\n   ‍   Playlist has **' + playlist.get('amount') + '** song(s)'
            );
        });

        stringMessage.sort();

        return app.envoyer.sendEmbededMessage(message, {
            color: 0x3498DB,
            title: `:musical_note: Music Playlist ${counter}`,
            description: '• ' + stringMessage.join('\n• ')
        });
    }

    sendSongsInPlaylist(message, guild, playlist, pageNumber = 1) {
        let songs = playlist.get('songs', []);
        if (songs.length === 0) {
            return app.envoyer.sendWarn(message, 'There are no songs in this playlist, you can add songs to it by using the\n`:command` commmand', {
                command: this.getPrefix(message) + this.getTriggers()[0] + ` ${playlist.get('name')} add <song url>`
            });
        }

        if (pageNumber < 1) {
            pageNumber = 1;
        }

        let pages = Math.ceil(songs.length / 10);
        if (pageNumber > pages) {
            pageNumber = pages;
        }

        let start = 10 * (pageNumber - 1);
        let playlistSongs = [];
        for (let i = start; i < start + 10; i++) {
            if (songs.length <= i) {
                break;
            }

            let song = songs[i];
            playlistSongs.push(`[${song.title}](${song.link})`);
        }

        let note = [
            `Page **${pageNumber}** out of **${pages}** pages.`,
            `\`:command ${playlist.get('name')} [page number]\``
        ];

        return app.envoyer.sendEmbededMessage(message, {
            color: 0x3498DB,
            title: `:musical_note: ${playlist.get('name')}`,
            description: '• ' + playlistSongs.join('\n• ') + '\n\n' + note.join('\n')
        }, {
            command: this.getPrefix(message) + this.getTriggers()[0]
        });
    }

    getPlaylist(playlists, playlistName) {
        for (let i in playlists) {
            let playlist = playlists[i];

            if (playlist.get('name').toLowerCase() !== playlistName.toLowerCase()) {
                continue;
            }
            return playlist;
        }
        return null;
    }

    getGuildAndPlaylists(message) {
        return new Promise((resolve, reject) => {
            return app.database.getGuild(message.guild.id).then(guild => {
                return app.database.getPlaylist(message.guild.id).then(playlists => {
                    return resolve({guild, playlists});
                });
            }).catch(err => reject(err));
        });
    }
}

module.exports = Playlist;
