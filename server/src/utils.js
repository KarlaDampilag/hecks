// FIXME move to a .env file
// The APP_SECRET is used to sign the JWTs which you’re issuing for your users
const APP_SECRET = 'sdlfkj08234lksdf';
const MAIL_HOST = 'smtp.mailtrap.io';
const MAIL_PORT = 2525;
const MAIL_USER = '2cf4ede4285dfb';
const MAIL_PASS = 'fb0fbf8f305d3a';
const FRONTEND_URL = 'http://localhost:3000';

module.exports = {
    APP_SECRET,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS,
    FRONTEND_URL
}