const express = require('express');
const router = express.Router();
const session = require('express-session');
const rateLimit = require("express-rate-limit");
const MongoDBStore = require('connect-mongodb-session')(session);
const config = require('../config');

module.exports = async (app, io, container) => {
    app.use(require('body-parser').json());

    // ---------------
    // Set up MongoDB session store
    let store = new MongoDBStore({
        uri: process.env.CONNECTION_STRING,
        collection: 'sessions'
    });

    // Catch session store errors
    store.on('error', function(err) {
        console.error(err);
    });

    // ---------------
    // Use sessions for tracking logins
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: config.sessionSecureCookies, // Requires HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 Year
        },
        store
    }));

    // ---------------
    // Enable CORS
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", config.clientUrl);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE, OPTIONS');
        next();
    });

    // ---------------
    // Rate limiting
    app.set('trust proxy', 1); // NOTE: App is behind a proxy in production so this is required.
    
    const limiter = rateLimit({
        windowMs: 1000, // 1 second
        max: 10 // limit each IP to X requests per windowMs
    });
    
    //  apply to all requests
    app.use(limiter);

    // ---------------
    // Register routes
    const game = require('../api/game')(router, io, container);
    const research = require('../api/game/research')(router, io, container);
    const trade = require('../api/game/trade')(router, io, container);
    const star = require('../api/game/star')(router, io, container);
    const carrier = require('../api/game/carrier')(router, io, container);
    const conversation = require('../api/game/conversation')(router, io, container);
    const ledger = require('../api/game/ledger')(router, io, container);
    const specialist = require('../api/game/specialist')(router, io, container);
    const auth = require('../api/auth')(router, io, container);
    const user = require('../api/user')(router, io, container);

    app.use(auth);
    app.use(user);
    app.use(game);
    app.use(research);
    app.use(trade);
    app.use(star);
    app.use(carrier);
    app.use(conversation);
    app.use(ledger);
    app.use(specialist);

    return app;
};
