const ValidationError = require('../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.get('/api/user/leaderboard', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.leaderboardService.getLeaderboard();
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/user/', async (req, res, next) => {
        let errors = [];

        if (!req.body.email) {
            errors.push('Email is a required field');
        }

        if (!req.body.username) {
            errors.push('Username is a required field');
        }

        if (!req.body.password) {
            errors.push('Password is a required field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let exists = await container.userService.userExists(req.body.email);

            if (exists) {
                return res.status(400).json({
                    errors: [
                        'An account with this email already exists.'
                    ]
                });
            }
            
            let userId = await container.userService.create({
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            });

            let emailResult = await container.emailService.sendTemplate(req.body.email, 'Welcome to Solaris', container.emailService.TEMPLATES.WELCOME);

            return res.status(201).json({ id: userId });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/', middleware.authenticate, async (req, res, next) => {
        try {
            let user = await container.userService.getMe(req.session.userId);

            return res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/:id', middleware.authenticate, async (req, res, next) => {
        try {
            let user = await container.userService.getById(req.params.id);

            return res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changeEmailPreference', middleware.authenticate, async (req, res, next) => {
        try {
            await container.userService.updateEmailPreference(req.session.userId, req.body.enabled);
            
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changeEmailAddress', middleware.authenticate, async (req, res, next) => {
        let errors = [];

        if (!req.body.email) {
            errors.push('Email is a required field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.userService.updateEmailAddress(req.session.userId, req.body.email);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changePassword', middleware.authenticate, async (req, res, next) => {
        let errors = [];

        if (!req.body.currentPassword) {
            errors.push('Current password is a required field');
        }

        if (!req.body.newPassword) {
            errors.push('New password is a required field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.userService.updatePassword(
                req.session.userId, 
                req.body.currentPassword,
                req.body.newPassword);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
