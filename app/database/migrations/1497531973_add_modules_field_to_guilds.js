
/**
 * Run the migrations, adding the modules column to the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.table(app.constants.GUILD_TABLE_NAME, table => {
        table.json('modules')
             .nullable()
             .after('aliases');
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
        table.dropColumn('modules');
    });
};
