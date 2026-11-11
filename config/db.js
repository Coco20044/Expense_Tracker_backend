const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();
const db = mysql.createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
ssl: {
    ca: fs.readFileSync(
        path.join(__dirname, "../certs/ca.pem")
    ),
    rejectUnauthorized: true
},

waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});
module.exports = db;