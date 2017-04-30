/** @ignore */
const Job = require('./Job');
/** @ignore */
const Music = require('./../commands/music/MusicHandler');

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

        for (let token in Music.playlist) {
            let cacheToken = `garbage-collector.music-playlist.${token}`;

            if (Music.playlist[token].length > 0) {
                continue;
            }

            if (!cacheAdapter.has(cacheToken)) {
                cacheAdapter.put(cacheToken, new Date, 120);
                continue;
            }

            cacheAdapter.forget(cacheToken);

            Music.forcefullyDeletePlaylist(token);
        }
    }
}

module.exports = GarbageCollectorJob;
