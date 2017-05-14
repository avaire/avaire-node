
/**
 * Run the migrations, adding a integer column called type to the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.table(app.constants.GUILD_TABLE_NAME, table => {
        table.integer('type')
             .default(0)
             .after('id');
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return knex.schema.table(app.constants.GUILD_TABLE_NAME, table => {
        table.dropColumn('type');
    });
};
