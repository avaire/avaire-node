
/**
 * Run the migrations, creating the shards table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.createTable(app.constants.SHARD_TABLE_NAME, table => {
        table.integer('id').unique();
        table.integer('count');
        table.string('address');
        table.string('version');
        table.integer('users').unsigned();
        table.integer('guilds').unsigned();
        table.integer('channels').unsigned();
        table.timestamps();

        table.collate('utf8_unicode_ci');
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return knex.schema.dropTable(app.constants.SHARD_TABLE_NAME);
};
