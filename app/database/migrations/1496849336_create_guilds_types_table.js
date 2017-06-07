
/**
 * Run the migrations, creating the guild types table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists(app.constants.GUILD_TYPE_TABLE_NAME, table => {
            table.integer('id').unique();
            table.string('name');
            table.json('limits');
            table.timestamps();

            table.collate('utf8_unicode_ci');
        }).then(() => {
            return knex(app.constants.GUILD_TYPE_TABLE_NAME).insert([
                {
                    id: 1,
                    name: 'VIP',
                    limits: JSON.stringify({
                        playlist: {
                            lists: 10,
                            songs: 50
                        },
                        aliases: 50
                    }),
                    created_at: new Date,
                    updated_at: new Date
                },
                {
                    id: 2,
                    name: 'VIP+',
                    limits: JSON.stringify({
                        playlist: {
                            lists: 25,
                            songs: 100
                        },
                        aliases: 150
                    }),
                    created_at: new Date,
                    updated_at: new Date
                }
            ]);
        })
    ]);
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists(app.constants.GUILD_TYPE_TABLE_NAME)
    ]);
};
