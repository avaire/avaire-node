/** @ignore */
const path = require('path');
/** @ignore */
const _ = require('lodash');
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

        /**
         * The default placeholders that should be added to
         * every message parsed through the language files.
         *
         * @type {Object}
         */
        this.defaultPlaceholders = {
            userid: message => message.author.id,
            channelid: message => message.channel.id,
            username: message => message.author.username,
            useravatar: message => message.author.avatar,
            userdiscr: message => message.author.discriminator
        };

        // Loads all the language strings.
        this.loadLanguageFiles();
    }

    /**
     * Loads all the language files from disk.
     *
     * @throws {SyntaxError}  Thrown if any of the language files has invalid JSON formatted in them.
     */
    loadLanguageFiles() {
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
        let guildLocal = this.getLocal(message, message.isPrivate);
        let langEntity = this.findLangEntity(`${guildLocal}.${string.trim().toLowerCase()}`);

        return this.formatResponse(message, langEntity, replacements);
    }

    /**
     * Gets the guilds local, if the provided message is a
     * private message the default local will be returned.
     *
     * @param  {IMessage|String} guildId    The discordie message object or guild id.
     * @param  {Boolean}         isPrivate  Determines if the message was private.
     * @return {String}
     */
    getLocal(guildId, isPrivate) {
        if (typeof isPrivate !== 'boolean') {
            return this.getLocal(guildId.guild.id, guildId.isPrivate);
        }

        if (isPrivate) {
            return this.defaultLocal;
        }

        // If the memory cach has the guild transformer we'll fetch
        // it from the cache, get the local from it and store
        // it in the guildLocalCache array for later use.
        let cache = app.cache.resolveAdapter('memory');
        if (cache.has(`database.${guildId}`)) {
            let transformer = cache.get(`database.${guildId}`);
            let guildLocal = typeof transformer.get('local') === 'string' ? transformer.get('local') : this.defaultLocal;

            guildLocalCache[guildId] = guildLocal;

            return guildLocal;
        }

        // Calls the database asynchronously to get a newer version of
        // the guild transformer in the memory cache, the call will
        // handle storing the transformer into the cache for us.
        app.database.getGuild(guildId);

        // If we have a version of the guilds local stored from before the
        // cache expired we'll use that instead of the default value.
        if (guildLocalCache[guildId] === undefined) {
            return this.defaultLocal;
        }
        return guildLocalCache[guildId];
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
     * @param  {IMessage}     message       The Discordie message object the message should be sent in.
     * @param  {String|Array} responses     The string or list of language strings that should be formatted.
     * @param  {Object]}      replacements  The object of items that should be replaced in the response.
     * @return {String}
     */
    formatResponse(message, responses, replacements) {
        let response = responses;
        if (_.isObjectLike(responses)) {
            response = _.sample(responses);
        }

        replacements = this.addDefaultPlacehodlers(message, replacements);

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

        for (let placeholder in this.defaultPlaceholders) {
            if (!placeholders.hasOwnProperty(placeholder)) {
                placeholders[placeholder] = this.defaultPlaceholders[placeholder](message);
            }
        }

        let sortedPlaceholders = {};
        let keys = Object.keys(placeholders);
        keys.sort((a, b) => b.length - a.length);

        for (let i = 0; i < keys.length; i++) {
            sortedPlaceholders[keys[i]] = placeholders[keys[i]];
        }

        return sortedPlaceholders;
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
