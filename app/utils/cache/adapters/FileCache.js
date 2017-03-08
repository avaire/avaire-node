/** @ignore */
const CacheAdapter = require('./CacheAdapter');
/** @ignore */
const crypto = require('crypto');
/** @ignore */
const fs = require('fs-extra');
/** @ignore */
const path = require('path');

class FileCache extends CacheAdapter {

    /**
     * Setup and prepares the adapter for use.
     * 
     * @return {undefined}
     */
    setup() {
        this.storagePath = path.resolve('storage', 'cache');
        this.setup = true;
    }

    /**
     * Checks if the adapter is ready to be used.
     * 
     * @return {Boolean}
     */
    isReady() {
        return this.setup;
    }

    /**
     * Parses the options into the adapter.
     * 
     * @param  {Object} options  The object of options needed for the adapter 
     * @return {undefined}
     */
    parseOptions(options) {
        if (options.hasOwnProperty('path')) {
            this.storagePath = path.resolve(options.path);
        }
    }

    /**
     * Store an item in the cache for a given number of seconds.
     * 
     * @param  {String} token     The cache item token
     * @param  {mixed}  value     The item that should be stored in the cache
     * @param  {mixed}  seconds   The amount of seconds the item should be stored for
     * @return {Boolean}
     */
    put(token, value, seconds) {
        token = this.formatToken(token);

        fs.ensureDirSync(token.path.storage, function (err) {
            if (err) {
                app.logger.error(err);
            }
        });

        if (! fs.existsSync(token.path.full)) {
            fs.closeSync(fs.openSync(token.path.full, 'w'));
        }

        let time = new Date().getTime() + (1000 * seconds);
        fs.writeFileSync(token.path.full, JSON.stringify({
            expire: new Date(time),
            data: value
        }));
        
        return true;
    }

    /**
     * Get an item from the cache, or store the default value.
     * 
     * @param  {String}  token     The cache item token
     * @param  {mixed}   seconds   The amount of seconds the item should be stored for
     * @param  {Closure} callback  The closure that should be invoked if the cache doesn't exists
     * @return {mixed}
     */
    remember(token, seconds, callback) {
        if (this.has(token)) {
            return this.get(token);
        }

        let value = callback();
        this.put(token, value, seconds);

        return value;
    }

    /**
     * Store an item in the cache indefinitely.
     * 
     * @param  {String}  token     The cache item token
     * @param  {mixed}   value     The item that should be stored in the cache
     * @return {mixed}
     */
    forever(token, value) {
        return this.put(token, value, 60 * 24 * 356 * 101);
    }

    /**
     * Retrieve an item from the cache by key.
     * 
     * @param  {String} token     The cache item token
     * @param  {mixed}  fallback  The fallback value if the item doesn't exists
     * @return {mixed}
     */
    get(token, fallback) {
        let result = this.getRaw(token, fallback);

        if (! result.hasOwnProperty('data')) {
            return fallback;
        }
        
        return result.data;
    }

    /**
     * Retrieve an item from the cache in raw form by key.
     * 
     * @param  {String} token     The cache item token
     * @param  {mixed}  fallback  The fallback value if the item doesn't exists
     * @return {mixed}
     */
    getRaw(token, fallback) {
        fallback = {
            expire: new Date,
            data: fallback
        };

        if (! this.has(token)) {
            return fallback ;
        }

        token = this.formatToken(token);
        let item = fs.readJsonSync(token.path.full, {throws: false});

        if (item == null) {
            return fallback;
        }

        return item;
    }

    /**
     * Determine if an item exists in the cache.
     * 
     * @param  {String} token     The cache item token
     * @return {Boolean}
     */
    has(token) {
        if (token == undefined) {
            return false;
        }

        token = this.formatToken(token);
        if (! fs.existsSync(token.path.full)) {
            return false;
        }

        let item = fs.readJsonSync(token.path.full, {throws: false});;

        if (item == null) {
            return false;
        }

        return new Date(item.expire) >= new Date;
    }

    /**
     * Remove an item from the cache.
     * 
     * @param  {String} token     The cache item token
     * @return {Boolean}
     */
    forget(token) {
        if (! this.has(token)) {
            return false;
        }

        fs.unlinkSync(this.formatToken(token).path.full);

        return true;
    }

    /**
     * Remove all items from the cache.
     * 
     * @return {Boolean}
     */
    flush() {
        let item = fs.emptyDirSync(this.storagePath, function (err) {
            if (err) {
                app.logger.error(err);
            }
        });

        return true;
    }

    /**
     * Formats the token to the storage path.
     * 
     * @param  {String} token     The cache item token
     * @return {Object}
     */
    formatToken(token) {
        let hash = crypto.createHash('md5').update(token.toLowerCase()).digest("hex");
        let name = hash.substr(6, hash.length);
        let cachePath = path.resolve(
            this.storagePath, hash.substr(0, 2), hash.substr(2, 2), hash.substr(4, 2)
        );
        
        return { 
            name: name, 
            path: {
                storage: cachePath,
                full: path.resolve(cachePath, name)
            },
        };
    }
}

module.exports = new FileCache;
