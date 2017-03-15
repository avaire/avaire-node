const path = require('path');
const _ = require('lodash');
const dot = require('dot-object');
const directory = require('require-directory');

let guildLocalCache = [];

class Language {
    constructor() {
        this.defaultLocal = 'en';
        this.resourcePath = path.resolve('resources/lang');
        this.loadLanguageFiles();
    }

    loadLanguageFiles() {
        for (let index in require.cache) {
            if (!_.startsWith(index, this.resourcePath)) {
                continue;
            }

            delete require.cache[index];
        }

        this.languageFiles = directory(module, this.resourcePath);
    }

    get(message, string, replacements) {
        let guildLocal = this.getLocal(message);
        let langEntity = this.findLangEntity(`${guildLocal}.${string.trim().toLowerCase()}`);

        return this.formatResponse(langEntity, replacements);
    }

    getLocal(message) {
        if (message.isPrivate) {
            return this.defaultLocal;
        }

        let cache = app.cache.resolveAdapter('memory');
        if (cache.has(`database.${message.guild.id}`)) {
            let transformer = cache.get(`database.${message.guild.id}`);
            let guildLocal = transformer.get('local') === null ? this.defaultLocal : transformer.get('local');

            guildLocalCache[message.guild.id] = guildLocal;

            return guildLocal;
        }

        app.database.getGuild(message.guild.id);

        if (guildLocalCache[message.guild.id] === undefined) {
            return this.defaultLocal;
        }
        return guildLocalCache[message.guild.id];
    }

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

    formatResponse(responses, replacements) {
        let response = responses;
        if (_.isObjectLike(responses)) {
            response = _.sample(responses);
        }

        if (!_.isPlainObject(replacements)) {
            return response;
        }

        for (let token in replacements) {
            response = _.replace(response, new RegExp(`:${token}`, 'gm'), replacements[token]);
        }

        return response;
    }

    getFiles() {
        return this.languageFiles;
    }
}

module.exports = new Language;
