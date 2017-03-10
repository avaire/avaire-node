/**
 * The task class that is used by the scheduler, the class 
 * allows you to interact with the delayed or repeating 
 * delayed task by starting or stoping it at any point.
 */
class Task {

    /**
     * Stores the task properties and prepares the task.
     * 
     * @param  {Closure} closure         The closure/callback that should be called 
     * @param  {Integer} delay           The delay before the task should be invoked
     * @param  {Integer} repeatingDelay  The delay before the task should repeat itself
     */
    constructor(closure, delay, repeatingDelay) {
        /**
         * The closure that should be invoked when the task is ready to run
         * 
         * @type {Closure}
         */
        this.closure = closure;
        
        /**
         * The delay before the task should be invoked
         * 
         * @type {Integer}
         */
        this.delay = delay;
        
        /**
         * The delay before the task should repeat itself, if
         * this property is undefined the task will not repeast.
         * 
         * @type {Integer}
         */
        this.repeatingDelay = typeof repeatingDelay !== 'undefined' ? repeatingDelay : -1;
        
        /**
         * The task state.
         * 
         * @type {Boolean}
         */
        this.running = false;
        
        /**
         * The task timer id, this is used to stop/cancel the task.
         * 
         * @type {Integer}
         */
        this.runnable = null;
    }

    /**
     * Starts the task if it isn't already running
     * 
     * @return {Task}
     */
    start() {
        if (this.isRunning()) {
            return this;
        }

        // If we have a repeatingDelay property that's less than zero(0) 
        // we'll just call the closure on the delay and then stop the task.
        if (this.repeatingDelay < 0) {
            this.runnable = setTimeout(function (task) {
                task.closure();
                task.running = false;
            }, this.delay, this);
            this.running = true;
            
            return this;
        }

        this.runnable = setTimeout(function (task) {
            task.closure();
            
            task.runnable = setInterval(function (task) {
                task.closure();
            }, task.repeatingDelay, task);
        }, this.delay, this);
        this.running = true;

        return this;
    }

    /**
     * Stops the task if it's running.
     * 
     * @return {Task}
     */
    stop() {
        if (this.isRunning()) {
            clearTimeout(this.runnable);
            this.running = false;
        }

        return this;
    }

    /**
     * Stops the task if it's running.
     * 
     * @return {Task}
     */
    cancel() {
        return this.stop();
    }

    /**
     * Gets the runnable id of the task.
     * 
     * @return {Timer}
     */
    getId() {
        return this.runnable;
    }

    /**
     * Checks if the task is currently running.
     * 
     * @return {Boolean}
     */
    isRunning() {
        return this.running;
    }
}

module.exports = Task;
