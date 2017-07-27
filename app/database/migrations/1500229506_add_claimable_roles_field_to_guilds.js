
/**
 * Run the migrations, creating the claimable roles field for the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.table(app.constants.GUILD_TABLE_NAME, table => {
        table.json('claimable_roles')
             .nullable()
             .after('channels_data');
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
        table.dropColumn('claimable_roles');
    });
};
