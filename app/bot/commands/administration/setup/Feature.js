class Feature {

    /**
     * The name of the feature.
     *
     * @return {String}
     */
    get name() {
        return 'Unknown';
    }

    /**
     * The description of the feature.
     *
     * @return {String}
     */
    get description() {
        return 'There are no description for this freature yet';
    }

    /**
     * Determins if the feature can be setup via a command.
     *
     * @return {Boolean}
     */
    get canBeFixedViaCommand() {
        return false;
    }

    /**
     * Checks if the feature is already setup.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {Boolean}
     */
    isSetup(sender, message) {
        return false;
    }

    /**
     * Executes the given feature.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @return {mixed}
     */
    execute(sender, message) {
        return false;
    }
}

module.exports = Feature;
