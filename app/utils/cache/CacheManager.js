/** @ignore */
const MemoryCache = require('./adapters/MemoryCache');
/** @ignore */
const FileCache = require('./adapters/FileCache');

class CacheManager {

    /**
     * Store an item in the cache for a given number of seconds.
     * 
     * @param  {String} token     The cache item token
     * @param  {mixed}  value     The item that should be stored in the cache
     * @param  {mixed}  seconds   The amount of seconds the item should be stored for
     * @param  {String} adapter   The adapter that should be used
     * @return {Boolean}
     */
    put(token, value, seconds, adapter) {
        return this.resolveAdapter(adapter).put(token, value, seconds);
    }

    /**
     * Get an item from the cache, or store the default value.
     * 
     * @param  {String}  token     The cache item token
     * @param  {mixed}   seconds   The amount of seconds the item should be stored for
     * @param  {Closure} callback  The closure that should be invoked if the cache doesn't exists
     * @param  {String}  adapter   The adapter that should be used
     * @return {mixed}
     */
    remember(token, seconds, callback, adapter) {
        return this.resolveAdapter(adapter).remember(token, seconds, callback);
    }

    /**
     * Store an item in the cache indefinitely.
     * 
     * @param  {String}  token     The cache item token
     * @param  {mixed}   value     The item that should be stored in the cache
     * @param  {String}  adapter   The adapter that should be used
     * @return {mixed}
     */
    forever(token, value, adapter) {
        return this.resolveAdapter(adapter).forever(token, value);
    }

    /**
     * Retrieve an item from the cache by key.
     * 
     * @param  {String} token     The cache item token
     * @param  {mixed}  fallback  The fallback value if the item doesn't exists
     * @param  {String} adapter   The adapter that should be used
     * @return {mixed}
     */
    get(token, fallback, adapter) {
        return this.resolveAdapter(adapter).get(token, fallback);
    }

    /**
     * Determine if an item exists in the cache.
     * 
     * @param  {String} token     The cache item token
     * @param  {String} adapter   The adapter that should be used
     * @return {Boolean}
     */
    has(token, adapter) {
        return this.resolveAdapter(adapter).has(token);
    }

    /**
     * Remove an item from the cache.
     * 
     * @param  {String} token     The cache item token
     * @param  {String} adapter   The adapter that should be used
     * @return {Boolean}
     */
    forget(token, adapter) {
        return this.resolveAdapter(adapter).forget(token);
    }

    /**
     * Remove all items from the cache.
     * 
     * @param  {String} adapter   The adapter that should be used
     * @return {Boolean}
     */
    flush(adapter) {
        return this.resolveAdapter(adapter).flush();
    }

    /**
     * Resolves the cache adapter.
     * 
     * @param  {String} adapter   The adapter that should be used
     * @return {CacheAdapter}
     */
    resolveAdapter(adapter) {
        if (adapter == undefined) {
            if (typeof this.defaultAdapter == 'undefined') {
                this.defaultAdapter = 'file';
            }
            
            return this.resolveAdapter(this.defaultAdapter);
        }

        switch (adapter.toLowerCase()) {
            case 'memory':
                return this.prepareAdapter(MemoryCache);
            
            case 'file':
                return this.prepareAdapter(FileCache);
            
            default:
                return this.resolveAdapter(this.defaultAdapter);
        }
    }

    /**
     * Prepares the cache adapter.
     * 
     * @param {String} adapter  The adapter that should be used
     */
    prepareAdapter(adapter) {
        if (adapter.isReady() !== true) {
            adapter.setup();
        }
        return adapter;
    }

    /**
     * Sets the default cache adapter
     * 
     * @param {String} adapter  The adapter that should be used
     */
    setDefaultAdapter(adapter) {
        this.defaultAdapter = adapter;
    }
}

module.exports = new CacheManager;
