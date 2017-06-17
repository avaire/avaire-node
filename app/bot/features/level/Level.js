/** @ignore */
const Feature = require('./../Feature');

/**
 * The Level feature.
 *
 * @extends {Feature}
 */
class Level extends Feature {

    constructor() {
        super();

        /**
         * The quadratic equation `a` value.
         *
         * @type {Number}
         */
        this.a = 5;

        /**
         * The quadratic equation `b` value.
         *
         * @type {Number}
         */
        this.b = 50;

        /**
         * The quadratic equation `c` value.
         *
         * @type {Number}
         */
        this.c = 100;
    }

    /**
     * Gets the XP needed to reach the given level using the quadratic equation.
     *
     * @param  {Number}  level  The level that should be converted to xp.
     * @return {Number}
     */
    getLevelXp(level) {
        return (this.a * Math.pow(level, 2)) + (this.b * level) + this.c;
    }

    /**
     * Gets the level from the XP given using the quadratic equation,
     * solving for X with our known a, b and c variables.
     *
     * @param  {Number}  xp  The xp that should be solved, xp has to be greater than -1.
     * @return {Number}
     */
    getLevelFromXp(xp) {
        if (Math.pow(this.b, 2) - ((4 * this.a) * (this.c - xp)) < 0) {
            return new Error('discriminant is less than zero, no real roots');
        }

        // Solves X for the quadratic equation, if our XP is lower than our C value we'll end up with a negativ
        // number, to prevent sending back a negative level we'll convert any number lower than 0 to 0.
        let x = (-this.b + Math.sqrt(Math.pow(this.b, 2) - ((4 * this.a) * (this.c - xp)))) / (2 * this.a);

        return x < 0 ? 0 : Math.floor(x);
    }
}

module.exports = new Level;
