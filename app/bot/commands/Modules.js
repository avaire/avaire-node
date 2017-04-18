/** @ignore */
let categories = require('./Categories');

/**
 * The modules class keeps track of command modules/categories
 * and their active status, if a module is disabled no one
 * can use commands for the given module.
 */
class Modules {

    /**
     * Loads and stores the modules/category names in the
     * modules object, preparing the class for use.
     */
    constructor() {
        /**
         * The modules object.
         *
         * @type {Object}
         */
        this.modules = {};

        categories.forEach(category => {
            this.modules[category.toLowerCase()] = true;
        });
    }

    /**
     * Checks if the module with the given name is enabled.
     *
     * @param  {String}  name  The name to use in the check.
     * @return {Boolean}
     */
    isEnabled(name) {
        if (!this.modules.hasOwnProperty(name)) {
            return false;
        }

        return this.modules[name];
    }

    /**
     * Checks if the module with the given name is disable.
     *
     * @param  {String}  name  The name to use in the checks.
     * @return {Boolean}
     */
    isDisabled(name) {
        return !this.isEnabled(name);
    }

    /**
     * Sets the module status for the given name if it exists.
     *
     * @param {String}   name   The name of the module that should be changed.
     * @param {Boolean}  value  The value that should be set.
     */
    setStatues(name, value) {
        if (this.modules.hasOwnProperty(name)) {
            this.modules[name] = value;
        }
    }

    /**
     * Gets all of the modules and their statuses.
     *
     * @return {Object}
     */
    all() {
        return this.modules;
    }
}

module.exports = new Modules;
