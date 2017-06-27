/** @ignore */
const CacheAdapter = require('./CacheAdapter');

/**
 * Memory Cache Adapter, used to cache things in memory.
 *
 * @extends {CacheAdapter}
 */
class MemoryCache extends CacheAdapter {

    /**
     * Setup and prepares the adapter for use.
     *
     * @return {undefined}
     */
    setup() {
        this.cache = [];
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
     * Store an item in the cache for a given number of seconds.
     *
     * @param  {String} token     The cache item token
     * @param  {mixed}  value     The item that should be stored in the cache
     * @param  {mixed}  seconds   The amount of seconds the item should be stored for
     * @return {Boolean}
     */
    put(token, value, seconds) {
        let time = new Date().getTime() + (1000 * seconds);

        this.cache[token.toLowerCase()] = {
            expire: new Date(time),
            data: value
        };

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
        if (!this.has(token)) {
            return fallback;
        }

        return this.cache[token.toLowerCase()].data;
    }

    /**
     * Retrieve an item from the cache in raw form by key.
     *
     * @param  {String} token     The cache item token
     * @param  {mixed}  fallback  The fallback value if the item doesn't exists
     * @return {mixed}
     */
    getRaw(token, fallback) {
        if (!this.has(token)) {
            return {
                expire: new Date,
                data: fallback
            };
        }

        return this.cache[token.toLowerCase()];
    }

    /**
     * Determine if an item exists in the cache.
     *
     * @param  {String} token     The cache item token
     * @return {Boolean}
     */
    has(token) {
        if (token === undefined || !this.cache.hasOwnProperty(token.toLowerCase())) {
            return false;
        }
        return this.cache[token.toLowerCase()].expire >= new Date;
    }

    /**
     * Remove an item from the cache.
     *
     * @param  {String} token     The cache item token
     * @return {Boolean}
     */
    forget(token) {
        if (!this.has(token)) {
            return false;
        }

        delete this.cache[token.toLowerCase()];
        return true;
    }

    /**
     * Remove all items from the cache.
     *
     * @return {Boolean}
     */
    flush() {
        this.cache = [];
        return true;
    }
}

module.exports = new MemoryCache;
