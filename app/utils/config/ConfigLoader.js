/** @ignore */
const path = require('path');

class ConfigLoader {

    /**
     * Loads the json configuration with the provided name.
     *
     * @param  {[type]}   name      The name of the config
     * @param  {Closure}  callback  The error callback handler
     * @return {Object}
     */
    loadConfiguration(name, callback) {
        try {
            return require(path.resolve(name));
        } catch (err) {
            if (typeof callback === 'function') {
                return callback(err);
            }

            throw err;
        }
    }
}

module.exports = new ConfigLoader();
