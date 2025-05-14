const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'dpg-d0i2flruibrs739sp6k0-a',
    user: 'ramesh',
    password: 'jcZjGEGQ8i1y60yV3XfdUTjJTLag8B8n',
    database: 'ramesh'
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ Connected to Render MySQL Database');
});

module.exports = db;
