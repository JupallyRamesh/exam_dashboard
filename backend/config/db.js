const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'dpg-d0i2flruibrs739sp6k0-a', // Render MySQL Database Host
    user: 'ramesh',                    // Render MySQL Database Username
    password: 'jcZjGEGQ8i1y60yV3XfdUTjJTLag8B8n', // Render MySQL Database Password
    database: 'ramesh'                 // Render MySQL Database Name
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ Connected to Render MySQL Database');
});

module.exports = db;
