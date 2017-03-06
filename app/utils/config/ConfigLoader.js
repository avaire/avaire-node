const path = require('path');

class ConfigLoader {
    loadConfiguration(name, callback) {
        try {
            return require(path.resolve(name));
        } catch (exception) {
            if (typeof callback == 'function') {
                return callback(exception);
            }

            throw exception;
        }
    }
}

module.exports = new ConfigLoader();
