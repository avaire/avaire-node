
/**
 * Run the migrations, adding the music fields to the shards table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.table(app.constants.SHARD_TABLE_NAME, table => {
        table.integer('voices')
             .after('channels');

        table.integer('songs')
             .after('voices');
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return knex.schema.table(app.constants.SHARD_TABLE_NAME, table => {
        table.dropColumn('voices');
        table.dropColumn('songs');
    });
};
