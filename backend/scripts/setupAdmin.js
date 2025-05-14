const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Admin credentials
const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    full_name: 'System Administrator'
};

// Hash the password
bcrypt.hash(adminUser.password, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }

    // First check if admin already exists
    db.query('SELECT id FROM users WHERE username = ? OR email = ?',
        [adminUser.username, adminUser.email],
        (err, results) => {
            if (err) {
                console.error('Error checking existing admin:', err);
                process.exit(1);
            }

            if (results.length > 0) {
                // Update existing admin
                db.query(
                    'UPDATE users SET password = ?, full_name = ? WHERE id = ?',
                    [hashedPassword, adminUser.full_name, results[0].id],
                    (err) => {
                        if (err) {
                            console.error('Error updating admin:', err);
                            process.exit(1);
                        }
                        console.log('Admin credentials updated successfully!');
                        process.exit(0);
                    }
                );
            } else {
                // Create new admin user
                db.query(
                    'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)',
                    [adminUser.username, adminUser.email, hashedPassword, adminUser.role, adminUser.full_name],
                    (err) => {
                        if (err) {
                            console.error('Error creating admin:', err);
                            process.exit(1);
                        }
                        console.log('Admin user created successfully!');
                        process.exit(0);
                    }
                );
            }
        }
    );
}); 