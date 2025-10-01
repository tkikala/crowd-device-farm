exports.up = function(knex) {
  return knex.schema.createTable('nodes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('hostname').notNullable();
    table.string('ip_address').notNullable();
    table.string('platform').notNullable(); // android, ios, windows, linux, macos
    table.string('os_version').notNullable();
    table.string('architecture').notNullable(); // x86, x64, arm64
    table.json('capabilities').defaultTo('{}'); // device-specific capabilities
    table.string('status').defaultTo('offline'); // offline, online, busy, maintenance
    table.timestamp('last_heartbeat').nullable();
    table.timestamp('registered_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('nodes');
};

