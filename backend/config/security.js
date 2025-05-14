const speakeasy = require('speakeasy');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// MFA Configuration
const generateMFASecret = () => {
    return speakeasy.generateSecret({
        name: 'Visually Challenged Exam System'
    });
};

const verifyMFAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });
};

// Security Middleware
const securityMiddleware = (app) => {
    // Enable HTTPS
    app.use(helmet());
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);
    
    // CORS configuration
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
};

module.exports = {
    generateMFASecret,
    verifyMFAToken,
    securityMiddleware
};
