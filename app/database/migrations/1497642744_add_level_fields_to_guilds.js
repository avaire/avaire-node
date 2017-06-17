
/**
 * Run the migrations, creating the level fields for the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.table(app.constants.GUILD_TABLE_NAME, table => {
        table.boolean('levels')
             .default(false)
             .after('local');

        table.boolean('level_alerts')
             .default(false)
             .after('levels');
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
        table.dropColumn('levels');
        table.dropColumn('level_alerts');
    });
};
