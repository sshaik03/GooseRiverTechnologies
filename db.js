const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_username',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 3000,
});

module.exports = pool;