exports.up = function(knex, Promise) {
    var schema = knex.schema;
    schema
        .createTable('team', function(table) {
          table.increments('id').primary();
          table.string('name').unique();
          table.text('description');
          table.timestamp('creation_date').defaultTo(knex.fn.now());
        })

        .createTable('user', function(table) {
            table.increments('id').primary();
            table.string('alias').unique();
            table.integer('rating');
            table.string('email');
            table.string('real_name');
            table.timestamp('creation_date').defaultTo(knex.fn.now());
            table.string('steam_name');
            table.string('country_code');
            table.string('avatar_small');
            table.string('avatar_medium');
            table.string('avatar_full');
            table.bigInteger('steamid64').unique();
            table.timestamp('steam_creation_date');
        })

        .createTable('usergroup', function(table) {
            table.string('name').primary();
            table.boolean('p_edit_users');
        })

        .createTable('match', function(table) {
            table.increments('id').primary();
            table.timestamp('date').defaultTo(knex.fn.now());
        })

        .createTable('forumcategory', function(table) {
            table.increments('id').primary();
            table.string('name');
        })

        .createTable('forum', function(table) {
            table.increments('id').primary();
            table.string('title');
        })

        .createTable('topic', function(table) {
            table.increments('id').primary();
            table.string('title');
        })

        .createTable('post', function(table) {
            table.increments('id').primary();
            table.text('content')
        })




        .table('user', function(table) {
            table.string('usergroup_name').references('usergroup.name');
            table.integer('team_id').references('team.id').onDelete('SET NULL');
        })

        .table('team', function(table) {
            table.integer('leader_id').references('user.id');
        })

        .table('match', function(table) {;
            table.integer('team1_id').references('team.id');
            table.integer('team2_id').references('team.id');
        })


        .table('forum', function(table) {
            table.integer('forumcategory_id').references('forumcategory.id');
        })

        .table('topic', function(table) {
            table.integer('first_post_id').references('post.id');
            table.integer('forum_id').references('forum.id');
            table.integer('user_id').references('user.id');
        })

        .table('post', function(table) {
            table.integer('topic_id').references('topic.id');
            table.integer('user_id').references('user.id');
        })



    return schema;

};


exports.down = function(knex, Promise) {
    var schema = knex.schema;
    

    schema
        .table('user', function(table) {
            table.dropForeign('usergroup_name');
            table.dropForeign('team_id');
        })

        .table('team', function(table) {
            table.dropForeign('leader_id');
        })

        .table('match', function(table) {;
            table.dropForeign('team1_id');
            table.dropForeign('team2_id');
        })


        .table('forum', function(table) {
            table.dropForeign('forumcategory_id');
        })

        .table('topic', function(table) {
            table.dropForeign('first_post_id');
            table.dropForeign('forum_id');
            table.dropForeign('user_id');
        })

        .table('post', function(table) {
            table.dropForeign('topic_id');
            table.dropForeign('user_id');
        })

        .dropTableIfExists('post')
        .dropTableIfExists('topic')
        .dropTableIfExists('forum')
        .dropTableIfExists('forumcategory')

        .dropTableIfExists('match')
        .dropTableIfExists('user')
        .dropTableIfExists('team')
        .dropTableIfExists('usergroup')

    return schema;

};
        
