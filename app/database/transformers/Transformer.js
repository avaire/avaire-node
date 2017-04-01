/** @ignore */
const _ = require('lodash');

/**
 * The "abstract" database table transformer, the class makes
 * it easier to transform database results into useable
 * objects, and back again into database records.
 *
 * @abstract
 */
class Transformer {

    /**
     * Prepares the transformer provided data.
     *
     * @param  {Object} data  The data that should be transformed.
     */
    constructor(data) {
        if (typeof data !== 'object') {
            data = {};
        }

        data = this.prepare(data, _);

        let defaults = this.defaults();
        for (let index in defaults) {
            if (!data.hasOwnProperty(index)) {
                data[index] = defaults[index];
                continue;
            }

            if (_.isObjectLike(defaults[index])) {
                for (let subIndex in defaults[index]) {
                    if (!data[index].hasOwnProperty(subIndex)) {
                        data[index][subIndex] = defaults[index][subIndex];
                    }
                }
            }
        }

        /**
         * The data that should be transformed.
         *
         * @type {Object}
         */
        this.data = data;
    }

    /**
     * Gets a propety from the transformer using dot notation to separate keys.
     *
     * @param  {String} property  The string that should be fetched from the transformer.
     * @param  {mixed}  fallback  The fallback value if the given property doesn't exists.
     * @return {mixed}
     */
    get(property, fallback = undefined) {
        if (typeof property === 'undefined') {
            return this.data;
        }

        let items = property.split('.');
        let data = this.all();
        for (let index in items) {
            let item = items[index];

            if (!data.hasOwnProperty(item)) {
                return fallback;
            }

            if (data[item] === null || data[item] === undefined) {
                return fallback;
            }

            data = data[item];
        }

        return data;
    }

    /**
     * Gets all the data from the transformer.
     *
     * @return {Object}
     */
    all() {
        return this.data;
    }

    /**
     * Prepares the transformers data.
     *
     * @param  {Object} data  The data that should be transformed.
     * @param  {Lodash} _     The lodash instance.
     * @return {Object}
     */
    prepare(data, _) {
        return data;
    }

    /**
     * The default data objects for the transformer.
     *
     * @return {Object}
     */
    defaults() {
        return {};
    }

    /**
     * Converts the transformers data into database bindable data.
     *
     * @return {Object}
     */
    toDatabaseBindings() {
        return this.data;
    }
}

module.exports = Transformer;
