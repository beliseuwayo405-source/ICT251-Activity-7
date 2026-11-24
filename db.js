const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbFile = process.env.DB_FILE || "./database.db";
const db = new DatabaseSync(dbFile);

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

const count = db.prepare("SELECT COUNT(*) AS c FROM records").get().c;
if (count === 0) {
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  db.exec(seed);
  console.log("Seeded 8 records");
}

module.exports = db;