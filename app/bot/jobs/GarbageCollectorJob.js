/** @ignore */
const Job = require('./Job');

/**
 * Garbage collector job, this job runs once every minute, every cycle
 * the job will go through all the memory cache items and delete
 * anything that has expired, this prevents having heaps of
 * data that isn't even used in the memory cache.
 *
 * @extends {Job}
 */
class GarbageCollectorJob extends Job {

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        let cacheAdapter = app.cache.resolveAdapter('memory');

        for (let token in cacheAdapter.cache) {
            if (!cacheAdapter.has(token)) {
                delete cacheAdapter.cache[token];
            }
        }
    }
}

module.exports = GarbageCollectorJob;
