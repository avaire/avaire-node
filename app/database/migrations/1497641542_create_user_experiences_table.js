
/**
 * Run the migrations, creating the experiences table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.createTable(app.constants.USER_EXPERIENCE_TABLE_NAME, table => {
        table.string('user_id');
        table.string('guild_id');
        table.string('username').collate('utf8mb4_unicode_ci');
        table.string('discriminator');
        table.string('avatar').nullable();
        table.integer('experience');
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
    return knex.schema.dropTable(app.constants.USER_EXPERIENCE_TABLE_NAME);
};
