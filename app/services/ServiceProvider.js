
/**
 * The "abstract" service provider class, service providers allows the
 * application to bootstrap and communicate with external services
 * in a way that is detached from the rest of the application.
 *
 * @abstract
 */
class ServiceProvider {

    /**
     * Setups the service provider by making sure it is disabled by default.
     */
    constructor() {
        /**
         * Determins if the service provided has been enabled or not.
         *
         * @type {Boolean}
         */
        this.isEnabled = false;
    }

    /**
     * Registers the service provider if it isn't already registered,
     * this will boot up the service provided and prepare it for use.
     *
     * @return {Boolean}  Returns true if the service provider was registered.
     */
    registerService() {
        if (!this.isEnabled) {
            this.isEnabled = this.register();
        }
        return this.isEnabled;
    }

    /**
     * Registers the service provider, this method should be overwritten
     * by child instances of the service provider class.
     *
     * @throws {Error}  If the method is not overwritten.
     * @return {Boolean}
     */
    register() {
        throw new Error('#register() is not implemented in the serivce provider');
    }

    /**
     * Returns the service for the service provider.
     *
     * @return {Object}
     */
    getService() {
        return this.service;
    }

    /**
     * Sets the service for the service provider.
     *
     * @param {Object} service  The service that should be set.
     */
    setService(service) {
        /**
         * Sets the service to the global service property
         * for the given service provided.
         *
         * @type {Object}
         */
        this.service = service;

        return true;
    }
}

module.exports = ServiceProvider;
