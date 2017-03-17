/** @ignore */
const path = require('path');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const dot = require('dot-object');
/** @ignore */
const directory = require('require-directory');

/** @ignore */
let guildLocalCache = [];

/**
 * The language string class, adds bilingual support to AvaIre, allowing for
 * strings to be translated into different languages on a per-guild basis.
 */
class Language {

    /**
     * Setups up and prepares the lanugage class.
     */
    constructor() {
        /**
         * The default local that should be used intead if the guild doesn't have a
         * cached version, or the language that is set for the guild is invaild.
         *
         * @type {String}
         */
        this.defaultLocal = 'en';

        /**
         * The resource path where all language file strings should be stored.
         *
         * @type {String}
         */
        this.resourcePath = path.resolve('resources/lang');

        // Loads all the language strings.
        this.loadLanguageFiles();
    }

    /**
     * Loads all the language files from disk, if the files already exists in the NPM
     * cache reference for required files the cache will be deleted before it is
     * loaded back in, this forces us to have the newest version of the files.
     *
     * Calling this method during runtime will fetch any changes made to the language files,
     * including entirely new languages and files, this allows for easier testing of
     * language strings and makes everything a bit more developer friendly.
     */
    loadLanguageFiles() {
        for (let index in require.cache) {
            if (!_.startsWith(index, this.resourcePath)) {
                continue;
            }

            delete require.cache[index];
        }

        this.languageFiles = directory(module, this.resourcePath);
    }

    /**
     * Get the provided language string from the guild messages local.
     *
     * @param  {IMessage} message       The Discordie message object the message should be sent in.
     * @param  {String}   string        The language string that should be fetched.
     * @param  {Object}   replacements  The list of items that should replace placeholders in the language string.
     * @return {String|undefined}
     */
    get(message, string, replacements) {
        replacements = this.addDefaultPlacehodlers(message, replacements);
        let guildLocal = this.getLocal(message);
        let langEntity = this.findLangEntity(`${guildLocal}.${string.trim().toLowerCase()}`);

        return this.formatResponse(langEntity, replacements);
    }

    /**
     * Gets the guilds local, if the provided message is a
     * private message the default local will be returned.
     *
     * @param  {IMessage} message  The discordie message object
     * @return {String}
     */
    getLocal(message) {
        if (message.isPrivate) {
            return this.defaultLocal;
        }

        // If the memory cach has the guild transformer we'll fetch
        // it from the cache, get the local from it and store
        // it in the guildLocalCache array for later use.
        let cache = app.cache.resolveAdapter('memory');
        if (cache.has(`database.${message.guild.id}`)) {
            let transformer = cache.get(`database.${message.guild.id}`);
            let guildLocal = typeof transformer.get('local') === 'string' ? transformer.get('local') : this.defaultLocal;

            guildLocalCache[message.guild.id] = guildLocal;

            return guildLocal;
        }

        // Calls the database asynchronously to get a newer version of
        // the guild transformer in the memory cache, the call will
        // handle storing the transformer into the cache for us.
        app.database.getGuild(message.guild.id);

        // If we have a version of the guilds local stored from before the
        // cache expired we'll use that instead of the default value.
        if (guildLocalCache[message.guild.id] === undefined) {
            return this.defaultLocal;
        }
        return guildLocalCache[message.guild.id];
    }

    /**
     * Gets the language entity based off the provided string.
     *
     * @param  {String} string  The string to get from the language files.
     * @param  {Array}  items   The recursive array of language string items.
     * @return {String|Array|undefined}
     */
    findLangEntity(string, items) {
        let split = string.split('.');
        let item = split.shift();

        if (typeof items === 'undefined') {
            items = this.languageFiles;
        }

        if (!items.hasOwnProperty(item)) {
            return undefined;
        }

        if (split.length === 0) {
            return items[item];
        }

        return this.findLangEntity(split.join('.'), items[item]);
    }

    /**
     * Formats the responses, returning a full language string.
     *
     * Items in the replacements object will replace placeholder items
     * in the response string, placeholders are definded by a
     * semicolon followed by the name of the placeholder.
     *
     * @param  {String|Array} responses     The string or list of language strings that should be formatted.
     * @param  {Object]}      replacements  The object of items that should be replaced in the response.
     * @return {String}
     */
    formatResponse(responses, replacements) {
        let response = responses;
        if (_.isObjectLike(responses)) {
            response = _.sample(responses);
        }

        for (let token in replacements) {
            response = _.replace(response, new RegExp(`:${token}`, 'gm'), replacements[token]);
        }

        return response;
    }

    /**
     * Add default placeholders to the placeholder object.
     *
     * @param {IMessage} message
     * @param {Object}   placeholders
     */
    addDefaultPlacehodlers(message, placeholders) {
        if (typeof placeholders !== 'object') {
            placeholders = {};
        }

        placeholders.userid = message.author.id;
        placeholders.channelid = message.channel_id;
        placeholders.username = message.author.username;
        placeholders.useravatar = message.author.avatar;
        placeholders.userdiscr = message.author.discriminator;

        return placeholders;
    }

    /**
     * Returns a list of all the language files and their strings.
     *
     * @return {Object}
     */
    getFiles() {
        return this.languageFiles;
    }
}

module.exports = new Language;
