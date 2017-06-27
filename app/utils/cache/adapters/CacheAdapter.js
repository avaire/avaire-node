
/**
 * Cache Adapter, all cache adaptations has to follow this
 * class format to work correctly with the cache manage.
 *
 * @abstract
 */
class CacheAdapter {

    /**
     * Parses the options into the adapter.
     *
     * @param  {Object} options  The object of options needed for the adapter
     * @return {undefined}
     */
    parseOptions(options) {
        //
    }

    /**
     * Setup and prepares the adapter for use.
     *
     * @return {undefined}
     */
    setup() {
        throw new Error('#setup() is not supported yet.');
    }

    /**
     * Checks if the adapter is ready to be used.
     *
     * @return {Boolean}
     */
    isReady() {
        throw new Error('#isReady() is not supported yet.');
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
        throw new Error('#put() is not supported yet.');
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
        throw new Error('#remember() is not supported yet.');
    }

    /**
     * Store an item in the cache indefinitely.
     *
     * @param  {String}  token     The cache item token
     * @param  {mixed}   value     The item that should be stored in the cache
     * @return {mixed}
     */
    forever(token, value) {
        throw new Error('#forever() is not supported yet.');
    }

    /**
     * Retrieve an item from the cache by key.
     *
     * @param  {String} token     The cache item token
     * @param  {mixed}  fallback  The fallback value if the item doesn't exists
     * @return {mixed}
     */
    get(token, fallback) {
        throw new Error('#get() is not supported yet.');
    }

    /**
     * Retrieve an item from the cache in raw form by key.
     *
     * @param  {String} token     The cache item token
     * @param  {mixed}  fallback  The fallback value if the item doesn't exists
     * @return {mixed}
     */
    getRaw(token, fallback) {
        throw new Error('#get() is not supported yet.');
    }

    /**
     * Determine if an item exists in the cache.
     *
     * @param  {String} token     The cache item token
     * @return {Boolean}
     */
    has(token) {
        throw new Error('#has() is not supported yet.');
    }

    /**
     * Remove an item from the cache.
     *
     * @param  {String} token     The cache item token
     * @return {Boolean}
     */
    forget(token) {
        throw new Error('#forget() is not supported yet.');
    }

    /**
     * Remove all items from the cache.
     *
     * @return {Boolean}
     */
    flush() {
        throw new Error('#flush() is not supported yet.');
    }
}

module.exports = CacheAdapter;
