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

class PlaylistCommand extends Command {

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
                'throttle.channel:2,4',
                'hasRole:DJ'
            ],
            usage: [
                '[name] add [song link]',
                '[name] create',
                '[name] delete',
                '[name] load',
                '[name] removesong [id]',
                '[name] renameto [new name]',
                '[name] [page number]'
            ]
        });

        /**
         * The playlist sub-commands that can be used to interact with the playlists.
         *
         * @type {Array}
         */
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
            },
            {
                triggers: ['removesong', 'remove'],
                function: (...args) => this.removeSongFromPlaylist(...args)
            },
            {
                triggers: ['renameto', 'rename'],
                function: (...args) => this.renamePlaylist(...args)
            }
        ];

        /**
         * The "playlist create command" command triggers
         *
         * @type {Object}
         */
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
        // Loads the guild and playlists from memory, if either of them are
        // not found in memory they will be re-retrived from the database.
        return this.getGuildAndPlaylists(message).then(({guild, playlists}) => {
            if (args.length === 0) {
                return this.sendPlaylists(message, guild, playlists);
            }

            if (playlists.length === 0 && args.length === 0) {
                return app.envoyer.sendInfo(message, 'This server does not have any music playlists yet, you can create one with\n`:command` to get started', {
                    command: this.getCommandTrigger(message) + ' <name> create'
                });
            }

            // If the playlist doesn't exists will see if the user wants to create
            // a playlist with the given name, if they don't want to create the
            // playlist we'll just tell them that the playlist doesn't exsits.
            let playlist = this.getPlaylist(playlists, args[0].toLowerCase());
            if (playlist === null) {
                if (args.length > 1 && _.indexOf(this.playlistCreateCommand.triggers, args[1].toLowerCase()) >= 0) {
                    return this.createPlaylist(message, args, guild, playlists);
                }

                return app.envoyer.sendWarn(message, 'There are no playlists called `:playlist`, you can create the playlist by using the\n`:command` command', {
                    command: this.getCommandTrigger(message) + ' <name> create',
                    playlist: args[0]
                });
            }

            // If the playlist exists and no additional arguments has been given we'll display
            // the songs in the playlist, we're omitting the songs list page number property
            // since by default it will assume we're on the first page.
            if (playlist !== null && args.length === 1) {
                return this.sendSongsInPlaylist(message, guild, playlist);
            }

            // Loops through all of our playlist sub-commands and tries to find something
            // that matches any of our sub-commands, if a sub-command is found the
            // logic function for the command will be invoked.
            let trigger = args[1].toLowerCase();
            for (let i in this.playlistCommands) {
                let property = this.playlistCommands[i];

                if (_.indexOf(property.triggers, trigger) === -1) {
                    continue;
                }
                return property.function(message, _.drop(args, 2), guild, playlist);
            }

            // Checks if the user wants to create a playlist that already exists, if the
            // user wants to create a playlist with a name that already exists the
            // createPlaylist method will end the command.
            if (_.indexOf(this.playlistCreateCommand.triggers, trigger) >= 0) {
                return this.createPlaylist(message, args, guild, playlists);
            }

            // Checks if the trigger is an integer, if the trigger is an integer the songs
            // in the playlist will be displayed for the page matching the given integer.
            let pageNumber = parseInt(trigger, 10);
            if (!isNaN(pageNumber)) {
                return this.sendSongsInPlaylist(message, guild, playlist, pageNumber);
            }

            return app.envoyer.sendWarn(message, 'Invalid `property` given, there are no playlist properties called `:property`.\nYou can learm more by running `:helpcommand :command`', {
                property: trigger,
                helpcommand: CommandHandler.getPrefix(message, 'help') + 'help',
                command: this.getCommandTrigger(message)
            });
        });
    }

    /**
     * Creates a playlist with the given name.
     *
     * @param  {IMessage}          message    The Discordie message object that triggered the command.
     * @param  {Array}             args       The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}  guild      The database guild transformer for the current guild.
     * @param  {Array}             playlists  An array of database playlist transformers that belongs to the current guild.
     * @return {Promise}
     */
    createPlaylist(message, args, guild, playlists) {
        if (this.getPlaylist(playlists, args[0]) !== null) {
            return app.envoyer.sendWarn(message, 'Playlist already exists');
        }

        let limit = guild.getType().get('limits.playlist.lists', 3);
        if (playlists.length >= limit) {
            return app.envoyer.sendWarn(message, 'The server doesn\'t have any more playlist slots, you can delete existing playlists to free up slots.');
        }

        let playlist = new PlaylistTransformer({
            guild_id: app.getGuildIdFrom(message),
            name: args[0]
        });

        return app.database.insert(app.constants.PLAYLIST_TABLE_NAME, {
            guild_id: app.getGuildIdFrom(message),
            name: args[0]
        }).then(() => {
            app.cache.forget('database-playlist.' + app.getGuildIdFrom(message), 'memory');

            return app.envoyer.sendSuccess(message, 'The `:playlist` playlist has been been created successfully!\nYou can start adding songs to it with `:command :playlist add <song>`', {
                command: this.getCommandTrigger(message),
                playlist: args[0]
            });
        });
    }

    /**
     * Loads the given playlist into the music queue for the current guild, if the music
     * isn't already playing in the given guild, the command will also make the bot
     * join the current voice channel the user is in, and start the music.
     *
     * @param  {IMessage}             message   The Discordie message object that triggered the command.
     * @param  {Array}                args      The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}     guild     The database guild transformer for the current guild.
     * @param  {PlaylistTransformer}  playlist  The database playlist transformer that was loaded in the onCommand method.
     * @return {Promise}
     */
    loadPlaylist(message, args, guild, playlist) {
        return Music.prepareVoice(message).then(() => {
            let queueSize = Music.getQueue(message).length;
            let songs = playlist.get('songs');

            app.envoyer.sendInfo(message, 'Loading `:amount` songs into the music queue, this might take awhile...', {
                amount: songs.length
            }).then(sentMessage => {
                let chain = [];
                for (let i in songs) {
                    let song = songs[i];

                    chain.push(new Promise((resolve, reject) => {
                        this.fetchSong(message, song.link).then(songObject => {
                            Music.addToQueue(message, songObject, song.link);

                            resolve();
                        });
                    }));
                }

                return Promise.all(chain).then(() => {
                    // If the queue was empty before we'll force the bot to start
                    // playing the song that was just requested immediately.
                    if (queueSize === 0) {
                        Music.next(message);
                    }

                    this.deleteMessage(sentMessage);
                    return app.envoyer.sendSuccess(message, 'The `:playlist` playlist with `:amount` songs has been loaded into the music queue.', {
                        playlist: playlist.get('name'),
                        amount: songs.length
                    });
                });
            });
        }).catch(err => app.envoyer.sendWarn(message, err.message, err.placeholders));
    }

    /**
     * Adds a song to the given playlist.
     *
     * @param  {IMessage}             message   The Discordie message object that triggered the command.
     * @param  {Array}                args      The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}     guild     The database guild transformer for the current guild.
     * @param  {PlaylistTransformer}  playlist  The database playlist transformer that was loaded in the onCommand method.
     * @return {Promise}
     */
    addSongToPlaylist(message, args, guild, playlist) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'Invalid format, missing song `url`\n`:command`', {
                command: this.getCommandTrigger(message) + ` ${playlist.get('name')} add <song url>`
            });
        }

        let guildType = guild.getType();
        if (playlist.get('songs', []).length >= guildType.get('limits.playlist.songs')) {
            return app.envoyer.sendWarn(message, 'The `:playlist` playlist doesn\'t have any more song slots.', {
                playlist: playlist.get('name')
            });
        }

        // Setup and prepares the song urls, if the given song
        // url isn't a valid url the command will be stoped.
        let songUrl = args.join(' ');
        let parsedUrl = URL.parse(songUrl);

        if (parsedUrl.host === 'www.youtube.com' && parsedUrl.path.indexOf('v=') === -1) {
            return app.envoyer.sendWarn(message, 'commands.music.require.invalid-youtube-link');
        }

        if (parsedUrl.host === null) {
            songUrl = 'ytsearch:' + songUrl;
        }

        // Attempts to fetch and format the song with the given url using the YouTube-DL library.
        message.channel.sendTyping();
        this.fetchSong(message, songUrl).then(song => {
            // If the song is returned with an invalid duration we can assume that the
            // requested "song" is actually a livestream or radio stream, we don't
            // really want that added to the playlist so we'll end the there.
            if (song.duration === 'NaN') {
                return app.envoyer.sendWarn(message, 'You can not add livestreams or radio streams to the playlists!');
            }

            // Assign the song url to the link property on the song object, this is
            // normaly done through the music handler, but since the song is added
            // to the database and we'll need it later when loading the playlist
            // into the music queue we'll just do it here.
            song.link = songUrl;
            if (parsedUrl.host === null) {
                song.link = song.webpage_url;
            }

            // Setup an array of all the songs in the playlist, if there are no songs in the
            // playlist it will default to an empty array, then add the new song to the
            // playlist transformers song list and update the song amount counter.
            let playlistSongs = playlist.get('songs', []);
            playlistSongs.push(song);
            playlist.data.songs = playlistSongs;
            playlist.data.amount = playlist.get('amount', 0) + 1;

            // Update the database to persist the new playlist songs array.
            return app.database.update(
                app.constants.PLAYLIST_TABLE_NAME, playlist.toDatabaseBindings(),
                query => query.where('id', playlist.get('id')).andWhere('guild_id', app.getGuildIdFrom(message))
            ).then(() => {
                return app.envoyer.sendSuccess(message, '<@:userid> has added [:songname](:songurl) to the `:playlist` playlist.\nThe `:playlist` playlist has `:slots` more song slots available.', {
                    songname: song.title,
                    songurl: song.link,
                    playlist: playlist.get('name'),
                    slots: guildType.get('limits.playlist.songs') - playlistSongs.length
                }).then(() => this.deleteMessage(message));
            }).catch(err => app.logger.error(err));
        }).catch(err => {
            app.logger.error('Failed to add a song to the queue: ', err);

            return app.envoyer.sendError(message, 'commands.music.require.error');
        });
    }

    /**
     * Deletes the given playlist.
     *
     * @param  {IMessage}             message   The Discordie message object that triggered the command.
     * @param  {Array}                args      The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}     guild     The database guild transformer for the current guild.
     * @param  {PlaylistTransformer}  playlist  The database playlist transformer that was loaded in the onCommand method.
     * @return {Promise}
     */
    deletePlaylist(message, args, guild, playlist) {
        return app.database.getClient().table(app.constants.PLAYLIST_TABLE_NAME).where({
            guild_id: playlist.get('guild_id'),
            id: playlist.get('id')
        }).del().then(() => {
            app.cache.forget('database-playlist.' + app.getGuildIdFrom(message), 'memory');

            return app.envoyer.sendInfo(message, 'The `:name` playlist has been deleted successfully!', {
                name: playlist.get('name')
            });
        });
    }

    /**
     * Removes a song for the current playlist if a number is given and the user has
     * a remove-playlist-song cache item, otherwise show songs for the given query.
     *
     * @param  {IMessage}             message   The Discordie message object that triggered the command.
     * @param  {Array}                args      The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}     guild     The database guild transformer for the current guild.
     * @param  {PlaylistTransformer}  playlist  The database playlist transformer that was loaded in the onCommand method.
     * @return {Promise}
     */
    removeSongFromPlaylist(message, args, guild, playlist) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'Invalid format, missing the `id` property!\n`:command`', {
                command: this.getCommandTrigger(message) + ` ${playlist.get('name')} removesong <id>`
            });
        }

        if (playlist.get('songs').length === 0) {
            return app.envoyer.sendWarn(message, 'The `:playlist` playlist is already empty, there is nothing to remove.', {
                playlist: playlist.get('name')
            });
        }

        let index = parseInt(args[0], 10);
        if (isNaN(index)) {
            return app.envoyer.sendWarn(message, 'Invalid id given, the id must be a number\n`:command`', {
                command: this.getCommandTrigger(message) + ` ${playlist.get('name')} removesong <id>`
            });
        }

        let id = index - 1;
        if (id < 0 || id >= playlist.get('songs').length) {
            return app.envoyer.sendWarn(message, 'Invalid id given, the number given is too :type.\n`:command`', {
                command: this.getCommandTrigger(message) + ` ${playlist.get('name')} removesong <id>`,
                type: id < 0 ? 'low' : 'high'
            });
        }

        let songs = playlist.get('songs', []);
        let song = songs[id];

        songs.splice(id, 1);
        playlist.data.songs = songs;
        playlist.data.amount = songs.length;

        return app.database.update(
            app.constants.PLAYLIST_TABLE_NAME, playlist.toDatabaseBindings(),
            query => query.where('id', playlist.get('id')).andWhere('guild_id', app.getGuildIdFrom(message))
        ).then(() => {
            return app.envoyer.sendSuccess(message, ':song has been successfully removed from the `:playlist` playlist', {
                playlist: playlist.get('name'),
                song: `[${song.title}](${song.link})`
            });
        }).catch(err => {
            app.logger.error('Failed to add a song to the queue: ', err);

            return app.envoyer.sendError(message, 'Somthing went wrong while trying to save the playlist changes to the database, try again later.');
        });
    }

    /**
     * Renames the given playlist to a given new name.
     *
     * @param  {IMessage}             message   The Discordie message object that triggered the command.
     * @param  {Array}                args      The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}     guild     The database guild transformer for the current guild.
     * @param  {PlaylistTransformer}  playlist  The database playlist transformer that was loaded in the onCommand method.
     * @return {Promise}
     */
    renamePlaylist(message, args, guild, playlist) {
        if (args.length === 0) {
            return app.envoyer.sendWarn(message, 'Invalid format, missing the `new name` property!\n`:command`', {
                command: this.getCommandTrigger(message) + ` ${playlist.get('name')} renameto <new name>`
            });
        }

        let newName = args[0];
        let oldName = playlist.get('name');

        // Loads the playlist from memory, the playlist has already been loaded in the
        // onCommand method so we're guaranteed that the playlist exists in the cache.
        return app.database.getPlaylist(app.getGuildIdFrom(message)).then(playlists => {
            if (this.getPlaylist(playlists, newName) !== null) {
                return app.envoyer.sendWarn(message, 'Can\'t rename the `:oldplaylist` to `:playlist`, there are already a playlist called `:playlist`', {
                    oldplaylist: oldName,
                    playlist: newName
                });
            }

            // Sets the new playlist name and attempts to update the database with the new playlist name,
            // if the playlist fails to updat the cached playlist name will be reset back to the old
            // playlist name to prevent any confusing since the name didn't actually change.
            playlist.data.name = args[0];
            return app.database.update(
                app.constants.PLAYLIST_TABLE_NAME, playlist.toDatabaseBindings(),
                query => query.where('id', playlist.get('id')).andWhere('guild_id', app.getGuildIdFrom(message))
            ).then(() => {
                return app.envoyer.sendSuccess(message, 'The `:oldplaylist` playlist has been renamed to `:playlist`!', {
                    oldplaylist: oldName,
                    playlist: args[0]
                });
            }).catch(err => {
                app.logger.error(err);
                playlist.data.name = oldName;

                return app.envoyer.sendError(message, 'Looks like something went wrong while trying to update the playlist.');
            });
        });
    }

    /**
     * Sends a list of all the playlists that belongs
     * to the current guild to the current channel.
     *
     * @param  {IMessage}          message    The Discordie message object that triggered the command.
     * @param  {Array}             args       The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}  guild      The database guild transformer for the current guild.
     * @param  {Array}             playlists  An array of database playlist transformers that belongs to the current guild.
     * @return {Promise}
     */
    sendPlaylists(message, guild, playlists) {
        let guildType = guild.getType();
        let counter = `   ‍   [ ${playlists.length} out of ${guildType.get('limits.playlist.lists')} ]`;

        if (playlists.length === 0) {
            return app.envoyer.sendEmbededMessage(message, {
                color: 0x3498DB,
                title: `:musical_note: Music Playlist ${counter}`,
                description: 'This server does not have any music playlists yet, you can create one with\n`:command` to get started'
            }, {
                command: this.getCommandTrigger(message) + ' <name> create'
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

    /**
     * Sends all the songs in the given playlist, if the playlist is empty a hit
     * on how to add songs to the playlist will be sent to the user instead.
     *
     * @param  {IMessage}             message   The Discordie message object that triggered the command.
     * @param  {Array}                args      The array of arguments parsed to the onCommand method.
     * @param  {GuildTransformer}     guild     The database guild transformer for the current guild.
     * @param  {PlaylistTransformer}  playlist  The database playlist transformer that was loaded in the onCommand method.
     * @return {Promise}
     */
    sendSongsInPlaylist(message, guild, playlist, pageNumber = 1) {
        let songs = playlist.get('songs', []);
        if (songs.length === 0) {
            return app.envoyer.sendWarn(message, 'There are no songs in this playlist, you can add songs to it by using the\n`:command` commmand', {
                command: this.getCommandTrigger(message) + ` ${playlist.get('name')} add <song url>`
            });
        }

        if (pageNumber < 1) {
            pageNumber = 1;
        }

        // Creates the pages based on how many songs we have in the current
        // playlist and paginates them with ten songs per page.
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
            playlistSongs.push(`\`${i + 1}\` [${song.title}](${song.link}) [${song.duration}]`);
        }

        let note = [
            `Page **${pageNumber}** out of **${pages}** pages.`,
            `\`:command ${playlist.get('name')} [page number]\``
        ];

        return app.envoyer.sendEmbededMessage(message, {
            color: 0x3498DB,
            title: `:musical_note: ${playlist.get('name')}`,
            description: playlistSongs.join('\n') + '\n\n' + note.join('\n')
        }, {
            command: this.getCommandTrigger(message)
        });
    }

    /**
     * Attempts to fetch the song using the YouTubeDL library, if the song was fetched the
     * method will also filter down the formats by audio bitrate, format and quality, in
     * the end returning the best version of the song for streaming via Discord.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {String}    url      The URl of the song that should be fetched.
     * @return {Promise}
     */
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

                // Removes all the unnecessary properties from the song object
                // so it doesn't take unnecessary space in the database.
                Music.unnecessaryProperties.forEach(property => {
                    if (song.hasOwnProperty(property)) {
                        delete song[property];
                    }
                });

                return resolve(song);
            });
        });
    }

    /**
     * Deletes the given message if the bot has permissions to delete messages.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    deleteMessage(message) {
        if (app.permission.botHas(message, 'text.manage_messages')) {
            return message.delete();
        }
        return Promise.resolve();
    }

    /**
     * Gets the playlist that matches the given name.
     *
     * @param  {Array}   playlists     An array of database playlist transformers that belongs to the current guild.
     * @param  {String}  playlistName  The name of the playlist that sound be matched.
     * @return {PlaylistTransformer|null}
     */
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

    /**
     * Gets the current guild transformer and all the
     * playlists that belongs to the current guild.
     *
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Promise}
     */
    getGuildAndPlaylists(message) {
        return new Promise((resolve, reject) => {
            return app.database.getGuild(app.getGuildIdFrom(message)).then(guild => {
                return app.database.getPlaylist(app.getGuildIdFrom(message)).then(playlists => {
                    return resolve({guild, playlists});
                });
            }).catch(err => reject(err));
        });
    }
}

module.exports = PlaylistCommand;
