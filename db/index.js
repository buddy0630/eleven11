const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "cs2shop",
  user: "postgres",
  password: "80939348",
});

module.exports = pool;
