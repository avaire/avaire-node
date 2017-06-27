
/**
 * Throttle, helps creating user, channel, and guild throtteling
 * within Ava with some help from the Cache utility.
 */
class Throttle {

    /**
     * Checks if the fingerprint is allowed to run with the provided settings.
     *
     * @param  {String}  fingerprint   The fingerprint that is used to store data in the cache
     * @param  {Integer} maxAttempts   The max number of attempts before the method should return false
     * @param  {Integer} decaySeconds  The number of seconds that has to pass for the cache to decay
     * @return {Boolean}
     */
    can(fingerprint, maxAttempts, decaySeconds) {
        let item = this.getThrottleItem(fingerprint);

        if (item.data++ >= maxAttempts) {
            return false;
        }

        return this.getCacheAdapter().put(fingerprint, item.data++, decaySeconds);
    }

    /**
     * Gets the raw cache throttle item.
     *
     * @param  {String} fingerprint  The fingerprint that is used to store data in the cache
     * @return {Object}
     */
    getThrottleItem(fingerprint) {
        return this.getCacheAdapter().getRaw(fingerprint, 0);
    }

    /**
     * Returns the memory cache adapter.
     *
     * @return {MemoryCache}
     */
    getCacheAdapter() {
        return app.cache.resolveAdapter('memory');
    }
}

module.exports = new Throttle;
